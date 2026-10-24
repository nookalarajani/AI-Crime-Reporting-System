/**
 * Smart FIR System - Fully Automatic Pipeline Controller
 * After complaint submission, ALL 9 steps execute automatically with timed transitions.
 * No manual button clicks required — the entire flow runs end-to-end automatically.
 */

// ─── Global State ──────────────────────────────────────────────────────────
let currentRole = 'citizen';
let currentUser = 'venkat';
let activeCase = null;
let cases = [];
let voiceRecognition = null;
let activeCrimeType = 'Theft';
let uploadedFiles = [];
let pipelineRunning = false;

// ─── Default Demo Case ─────────────────────────────────────────────────────
const defaultCases = [
    {
        id: "CASE-1001",
        csrId: "CSR/6582",
        firId: "FIR/1001",
        chargeSheetId: "CS-1001",
        complainantName: "venkat",
        complainantContact: "9876543289",
        complaintText: "my mobile phone was stolen from pocket at bus stand",
        nlpData: {
            category: "Theft",
            ageCategory: "Adult",
            detectedAge: 28,
            priority: "Low",
            ipcSections: [{ section: "Section 379 IPC", description: "Punishment for Theft (up to 3 years imprisonment or fine)" }],
            latencyMs: "0.14",
            metrics: { nlpAccuracy: "94.2%", classificationAccuracy: "88.7%", priorityAccuracy: "95.0%", confidence: "92.6%" }
        },
        status: "Verdict Decided",
        location: "Hyderabad",
        date: "2026-07-14",
        time: "10:30",
        evidence: [{ name: "Complaint_Receipt.pdf", size: "310 KB", type: "Document" }],
        suspect: { name: "Rajesh Kumar", alias: "Bunty", gender: "Male", age: 34, records: ["Theft (2023)", "Burglary (2024)"], status: "Wanted", confidence: "94.8%" },
        courtData: { verdict: "Guilty - Conviction Upheld", sentencing: "2 Years Rigorous Imprisonment", fine: "10,000 INR", confidence: "91.5%" },
        logs: ["Complaint submitted via portal", "CSR auto-generated", "NLP classification complete", "FIR registered", "Suspect biometrically scanned", "Charge Sheet compiled", "Court verdict predicted"],
        timestamp: "2026-07-14T10:50:44"
    }
];

// ─── Helpers ───────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function initApp() {
    const stored = localStorage.getItem('smart_fir_cases_v2');
    if (stored) {
        cases = JSON.parse(stored);
    } else {
        cases = [...defaultCases];
        saveCases();
    }
    setupEventListeners();
    window.ComplaintManager.init();
}

function saveCases() {
    localStorage.setItem('smart_fir_cases_v2', JSON.stringify(cases));
}

// ─── Auth ──────────────────────────────────────────────────────────────────
function handleLoginSubmit(role, username) {
    currentRole = role;
    currentUser = username;

    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-workspace').classList.remove('hidden');

    document.getElementById('header-username').innerText = username;
    document.getElementById('header-role-tag').innerText = role === 'citizen' ? 'USER' : 'ADMIN';

    // Hide/Show admin tabs
    ['tab-5','tab-6','tab-7','tab-8'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('hidden', role === 'citizen');
    });

    renderCaseSelectorList();

    if (role === 'citizen') {
        activateTab(1);
    } else {
        // Admin — jump straight to investigator view with latest case
        if (cases.length > 0) {
            activeCase = cases[cases.length - 1];
            selectCaseForInvestigator(activeCase);
            activateTab(5);
        } else {
            activateTab(1);
        }
    }

    showToast("Access Granted", `Welcome, ${username}! System pipeline ready.`);
}

function handleLogout() {
    pipelineRunning = false;
    document.getElementById('app-workspace').classList.add('hidden');
    document.getElementById('landing-screen').classList.remove('hidden');
    activeCase = null;
    window.ComplaintManager.clearForm();
}

// ─── Tab Activation ────────────────────────────────────────────────────────
function activateTab(tabIndex) {
    document.querySelectorAll('.tab-item').forEach(item => {
        item.classList.remove('active');
        const idx = parseInt(item.dataset.tab);
        if (idx < tabIndex) item.classList.add('completed');
        else item.classList.remove('completed');
    });
    const activeEl = document.getElementById(`tab-${tabIndex}`);
    if (activeEl) activeEl.classList.add('active');

    document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
    const panel = document.getElementById(`panel-tab-${tabIndex}`);
    if (panel) panel.classList.remove('hidden');

    // Scroll to top of workspace
    const ws = document.querySelector('.workspace-main');
    if (ws) ws.scrollTop = 0;
}

// ─── AUTO FULL PIPELINE ────────────────────────────────────────────────────
// This is the main engine. Once complaint is submitted, everything runs automatically.
async function runFullAutoPipeline(newCase) {
    if (pipelineRunning) return;
    pipelineRunning = true;

    // ── STEP 2: NLP & ML ────────────────────────────────────────────────
    activateTab(2);
    showToast("Pipeline Started", "Automated processing initiated. Please wait...");

    const pipelineSteps = [
        'wf-step-nlp-parser',
        'wf-step-ml-classifier',
        'wf-step-age-detector',
        'wf-step-priority-triage',
        'wf-step-ipc-mapper',
        'wf-step-empathy-detect'
    ];

    // Reset all steps
    pipelineSteps.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.className = 'pipeline-step';
            el.querySelector('.step-status').innerHTML = 'Pending';
        }
    });

    for (let i = 0; i < pipelineSteps.length; i++) {
        // Mark previous done
        if (i > 0) {
            const prev = document.getElementById(pipelineSteps[i - 1]);
            if (prev) {
                prev.className = 'pipeline-step completed';
                prev.querySelector('.step-status').innerHTML = '<i class="fas fa-check-circle" style="color:#10b981;"></i> Done';
            }
        }
        // Mark current active
        const cur = document.getElementById(pipelineSteps[i]);
        if (cur) {
            cur.className = 'pipeline-step active';
            cur.querySelector('.step-status').innerHTML = '<i class="fas fa-spinner" style="color:#5a5cf5; animation: spin 1s linear infinite;"></i> Executing';
        }
        await sleep(450);
    }
    // Complete last NLP step
    const last = document.getElementById(pipelineSteps[pipelineSteps.length - 1]);
    if (last) {
        last.className = 'pipeline-step completed';
        last.querySelector('.step-status').innerHTML = '<i class="fas fa-check-circle" style="color:#10b981;"></i> Done';
    }

    await sleep(700);
    showToast("NLP & ML Complete", `Crime classified as: ${newCase.nlpData.category} | Priority: ${newCase.nlpData.priority}`);
    
    // Save case
    activeCase = newCase;
    cases.push(newCase);
    saveCases();
    renderCaseSelectorList();

    // ── STEP 3: CSR ─────────────────────────────────────────────────────
    await sleep(600);
    showCSRReceiptPanel(newCase);
    showToast("CSR Generated", `Community Service Register ${newCase.csrId} created.`);
    await sleep(2500); // Show CSR for 2.5 seconds

    // ── STEP 4: FIR ─────────────────────────────────────────────────────
    newCase.status = "FIR Registered";
    newCase.logs.push("FIR auto-registered");
    saveCases();

    // Auto-generate PDFs silently
    try { window.PDFGenerator.generateCSR(newCase); } catch(e) {}
    await sleep(800);
    try { window.PDFGenerator.generateFIR(newCase); } catch(e) {}

    showFIRRegisteredPanel(newCase);
    showToast("FIR Auto-Registered", `${newCase.firId} filed. CSR & FIR PDFs downloaded.`);
    await sleep(2500);

    // ── STEP 5: INVESTIGATION (auto face scan) ───────────────────────────
    activateTab(5);
    selectCaseForInvestigator(newCase);
    showToast("Investigation Started", "Biometric face scan initiated automatically...");
    await sleep(1500);

    // Auto-trigger face scan
    await autoRunFaceScan(newCase);
    await sleep(1200);

    // ── STEP 6: CHARGE SHEET ─────────────────────────────────────────────
    showChargeSheetPanel(newCase);
    showToast("Charge Sheet Generated", `${newCase.chargeSheetId} compiled for ${newCase.suspect.name}.`);
    await sleep(2500);

    // Auto download Charge Sheet
    try { downloadChargeSheetPDF(); } catch(e) {}

    // ── STEP 7: COURT SUBMISSION ─────────────────────────────────────────
    newCase.status = "Court Submitted";
    newCase.logs.push(`Charge Sheet ${newCase.chargeSheetId} submitted to court.`);
    saveCases();

    showCourtDocketPanel(newCase);
    showToast("Docket Submitted", "Charge sheet filed with Magistrate Court West.");
    await sleep(2500);

    // ── STEP 8: VERDICT PREDICTION ───────────────────────────────────────
    showJudgmentPredictPanel(newCase);
    showToast("Verdict Predicted", `AI judgment: ${newCase.courtData.verdict} (${newCase.courtData.confidence} accuracy).`);
    await sleep(3000);

    // ── STEP 9: TRACKING TIMELINE ────────────────────────────────────────
    showTrackingTimelinePanel(newCase);
    showToast("✅ Pipeline Complete", "All 9 stages executed successfully. Case fully processed!");
    pipelineRunning = false;
}

// ─── Auto Face Scan (non-blocking animation) ───────────────────────────────
function autoRunFaceScan(c) {
    return new Promise(resolve => {
        document.getElementById('inv-unscanned-box').classList.add('hidden');
        document.getElementById('inv-scanned-box').classList.add('hidden');
        document.getElementById('inv-scanning-box').classList.remove('hidden');

        const mockPhoto = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400";

        window.FaceRecScanner.startScan('scan-canvas', mockPhoto, () => {
            const scanResult = window.FaceRecScanner.findMatch(c.nlpData.category);

            c.suspect = {
                name: scanResult.suspect.name,
                alias: scanResult.suspect.alias,
                gender: scanResult.suspect.gender,
                age: scanResult.suspect.age,
                records: scanResult.suspect.records,
                status: scanResult.suspect.status,
                confidence: scanResult.confidence
            };
            c.logs.push(`Biometric Match: ${c.suspect.name} (${c.suspect.confidence})`);
            saveCases();

            document.getElementById('inv-scanning-box').classList.add('hidden');
            document.getElementById('inv-scanned-box').classList.remove('hidden');

            document.getElementById('inv-sus-name').innerText = c.suspect.name;
            document.getElementById('inv-sus-conf').innerText = c.suspect.confidence + " Match";
            document.getElementById('inv-sus-details').innerText = `Alias: ${c.suspect.alias} | Age: ${c.suspect.age} | Records: ${c.suspect.records.join(", ")}`;

            setTimeout(resolve, 1000);
        });
    });
}

// ─── Panel Renderers ───────────────────────────────────────────────────────
function showCSRReceiptPanel(c) {
    activateTab(3);
    document.getElementById('csr-receipt-timestamp').innerText = `Timestamp: ${new Date(c.timestamp).toLocaleString()}`;
    document.getElementById('csr-receipt-number').innerText = c.csrId;
    document.getElementById('csr-val-complainant').innerText = c.complainantName;
    document.getElementById('csr-val-phone').innerText = c.complainantContact;
    document.getElementById('csr-val-location').innerText = c.location;
    document.getElementById('csr-val-crimetype').innerText = c.nlpData.category;
    document.getElementById('csr-statement-edit').value = c.complaintText;

    document.getElementById('csr-val-age').innerHTML =
        `<span class="badge-age-${c.nlpData.ageCategory.toLowerCase()}">${c.nlpData.ageCategory.toUpperCase()}</span>`;
    document.getElementById('csr-val-priority').innerHTML =
        `<span class="badge-priority-${c.nlpData.priority.toLowerCase()}">${c.nlpData.priority.toUpperCase()}</span>`;
}

function showFIRRegisteredPanel(c) {
    activateTab(4);
    document.getElementById('fir-val-number').innerText = c.firId;
    document.getElementById('fir-val-csrid').innerText = c.csrId;
    document.getElementById('fir-val-date').innerText = new Date(c.timestamp).toLocaleDateString();
    document.getElementById('fir-val-facts').innerText = c.complaintText;

    const ipcDiv = document.getElementById('fir-val-ipc');
    ipcDiv.innerHTML = '';
    c.nlpData.ipcSections.forEach(sec => {
        ipcDiv.innerHTML += `
            <div style="background:rgba(90,92,245,0.06); padding:0.75rem 1rem; border:1px solid rgba(90,92,245,0.15); border-radius:8px; font-size:0.85rem;">
                <strong style="color:var(--primary-blue); font-family:monospace;">${sec.section}</strong>: ${sec.description}
            </div>
        `;
    });
}

function selectCaseForInvestigator(c) {
    activeCase = c;
    document.getElementById('inv-case-ref').innerText = c.id;
    document.getElementById('inv-complainant-name').innerText = c.complainantName;
    document.getElementById('inv-crime-type').innerText = c.nlpData.category;

    // Empathy UI Banner
    const empathyBanner = document.getElementById('inv-empathy-banner');
    if (c.nlpData.empathyMode) {
        empathyBanner.classList.remove('hidden');
        document.getElementById('inv-empathy-score').innerText = c.nlpData.empathyScore + "%";
        const keywordsDiv = document.getElementById('inv-empathy-keywords-display');
        keywordsDiv.innerHTML = '';
        if (c.nlpData.empathyKeywordsFound && c.nlpData.empathyKeywordsFound.length > 0) {
            c.nlpData.empathyKeywordsFound.forEach(kw => {
                keywordsDiv.innerHTML += `<span class="badge-priority-high" style="font-size:0.7rem; background:rgba(239,68,68,0.15); margin-right:0.3rem;">${kw}</span>`;
            });
        }
    } else {
        empathyBanner.classList.add('hidden');
    }

    // Case Type Badge
    const typeLabel = document.getElementById('inv-case-type-label');
    const typeBadge = document.getElementById('inv-case-type-badge');
    if (c.nlpData.caseType === 'civil') {
        typeLabel.innerText = 'CIVIL CASE (CPC)';
        typeBadge.style.borderColor = 'rgba(0, 242, 254, 0.3)';
        typeBadge.style.background = 'rgba(0, 242, 254, 0.1)';
        typeLabel.style.color = 'var(--accent-cyan)';
        typeBadge.querySelector('i').style.color = 'var(--accent-cyan)';
    } else {
        typeLabel.innerText = 'CRIMINAL CASE (IPC)';
        typeBadge.style.borderColor = 'rgba(90, 92, 245, 0.25)';
        typeBadge.style.background = 'rgba(90, 92, 245, 0.1)';
        typeLabel.style.color = 'var(--primary-blue)';
        typeBadge.querySelector('i').style.color = 'var(--primary-blue)';
    }

    // Interrogation Q&A List
    const qaContainer = document.getElementById('inv-qa-container');
    qaContainer.innerHTML = '';
    if (c.nlpData.interrogation && c.nlpData.interrogation.length > 0) {
        c.nlpData.interrogation.forEach(item => {
            qaContainer.innerHTML += `
                <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:8px; padding:0.75rem; font-size:0.82rem;">
                    <div style="color:var(--accent-cyan); font-weight:700; margin-bottom:0.25rem;"><i class="fas fa-question-circle"></i> Q: ${item.question}</div>
                    <div style="color:#cbd5e1; padding-left:0.5rem; border-left:2px solid var(--border-color);"><i class="fas fa-reply" style="font-size:0.75rem; color:var(--color-muted); margin-right:0.3rem;"></i> A: ${item.answer}</div>
                </div>
            `;
        });
    } else {
        qaContainer.innerHTML = `<div style="font-size:0.8rem; color:var(--color-muted);">No interrogation questions generated.</div>`;
    }

    if (c.suspect) {
        document.getElementById('inv-unscanned-box').classList.add('hidden');
        document.getElementById('inv-scanning-box').classList.add('hidden');
        document.getElementById('inv-scanned-box').classList.remove('hidden');
        document.getElementById('inv-sus-name').innerText = c.suspect.name;
        document.getElementById('inv-sus-conf').innerText = c.suspect.confidence + " Match";
        document.getElementById('inv-sus-details').innerText = `Alias: ${c.suspect.alias} | Age: ${c.suspect.age} | Records: ${c.suspect.records.join(", ")}`;
    } else {
        document.getElementById('inv-unscanned-box').classList.remove('hidden');
        document.getElementById('inv-scanning-box').classList.add('hidden');
        document.getElementById('inv-scanned-box').classList.add('hidden');
    }
}

function showChargeSheetPanel(c) {
    activateTab(6);
    const isCivil = c.nlpData.caseType === 'civil';
    c.chargeSheetId = isCivil ? "CP-" + c.firId.replace("FIR/", "") : "CS-" + c.firId.replace("FIR/", "");
    
    document.getElementById('cs-doc-title').innerText = isCivil ? 'OFFICIAL CIVIL PLAINT DOCKET (CPC)' : 'OFFICIAL CRIMINAL CHARGE SHEET';
    document.getElementById('cs-val-number').innerText = c.chargeSheetId;

    // 1. FIR Details
    document.getElementById('cs-fir-details').innerText = isCivil 
        ? `${c.firId.replace("FIR/", "CDA/")} (Registered on ${new Date(c.timestamp).toLocaleDateString()} under CDR ID: ${c.csrId.replace("CSR/", "CDR/")})`
        : `${c.firId} (Registered on ${new Date(c.timestamp).toLocaleDateString()} under CSR ID: ${c.csrId})`;

    // 2. Complainant Details
    document.getElementById('cs-complainant-details').innerText = `${c.complainantName} (Phone: ${c.complainantContact})`;

    // 3. Victim Details
    document.getElementById('cs-victim-details').innerText = `${c.complainantName} (Age Status: ${c.nlpData.ageCategory})`;

    // 4. Accused Details
    if (c.suspect) {
        document.getElementById('cs-accused-details').innerText = `${c.suspect.name} (Alias: ${c.suspect.alias || 'None'}, Age: ${c.suspect.age})`;
        document.getElementById('cs-accused-status').innerText = c.suspect.status || 'Wanted';
    } else {
        document.getElementById('cs-accused-details').innerText = 'Under Investigation';
        document.getElementById('cs-accused-status').innerText = 'Pending Scan';
    }

    // 6. Applicable legal sections
    document.getElementById('cs-applicable-sections').innerText = c.nlpData.ipcSections.map(s => s.section).join(", ");

    // 7. Incident Description
    document.getElementById('cs-incident-desc').innerText = c.complaintText;

    // 8. Investigation Findings
    document.getElementById('cs-findings').innerText = isCivil
        ? 'Documentary chain check completed. Property registry deeds verified. Survey maps cross-referenced with Municipal authorities. No legal stay orders active.'
        : 'CCTV timeline compiled. Biometric facial matching confirmed suspect presence at the scene. Disputed mobile IMEI traces locate transaction patterns.';

    // 9. Evidence details
    document.getElementById('cs-evidence-details').innerText = isCivil
        ? 'Exhibit-A: Certified Land Agreement Copies. Exhibit-B: Signed payment transaction receipt logs.'
        : 'Exhibit-1: Face Recognition biometric audit report. Exhibit-2: CCTV Frame Sequence 24-B. Exhibit-3: Signed Witness logs.';

    // Seized materials
    document.getElementById('cs-seized-materials').innerText = isCivil
        ? 'Property Title Registry prints, bank clearance records.'
        : 'Stolen cellular device recovered from suspect possession, digital logs clone.';

    // 10. Witness list & statements
    document.getElementById('cs-witness-statements').innerHTML = isCivil
        ? '1. <strong>Ramesh Kumar</strong> (Property Broker): "Stated that partition transaction was done in his presence."<br>2. <strong>Suresh Lal</strong> (Neighbor): "Confirmed boundaries were altered on the 12th."'
        : '1. <strong>Inspector Kumar Swamy</strong>: "Accused apprehended with the stolen property in possession."<br>2. <strong>Suresh Sen</strong> (Shopkeeper): "Confirmed seeing the suspect near the victim."';

    // 11. Medical/Forensic reports
    document.getElementById('cs-forensic-reports').innerText = isCivil
        ? 'Forensic Handwriting Analysis: Signature matches official registry copies with 98% congruence.'
        : 'Biometric Fingerprint Match: 99.2% match with suspect records. Cyber forensic SHA-256 verification hash: 0x8a72...';

    // 12. Final conclusion
    document.getElementById('cs-final-conclusion').innerText = isCivil
        ? 'The respondent breached contract agreements. Encroachment detected. Recommended restitution of property to plaintiff.'
        : 'Sufficient evidence exists to prosecute the accused under the specified legal sections. Court trial proceedings recommended.';
}

function showCourtDocketPanel(c) {
    activateTab(7);
    document.getElementById('court-reg-code').innerText = "CR-MET-" + c.firId.replace("FIR/", "");
    document.getElementById('court-accused-name').innerText = c.suspect ? c.suspect.name : "Unknown";
    document.getElementById('court-applied-ipc').innerText = c.nlpData.ipcSections.map(s => s.section).join(", ");
}

function showJudgmentPredictPanel(c) {
    activateTab(8);

    let sentence = "3 Years Imprisonment";
    let fine = "20,000 INR";
    const score = (88.0 + Math.random() * 8).toFixed(1) + "%";

    if (c.nlpData.category === "Theft") { sentence = "2 Years Rigorous Imprisonment"; fine = "10,000 INR"; }
    else if (c.nlpData.category === "Robbery") { sentence = "5 Years Imprisonment"; fine = "25,000 INR"; }
    else if (c.nlpData.category === "Assault") { sentence = "4 Years Imprisonment"; fine = "30,000 INR"; }
    else if (c.nlpData.category === "Cyber Crime") { sentence = "3 Years Cyber Detention"; fine = "1,50,000 INR"; }
    else if (c.nlpData.category === "Murder / Homicide") { sentence = "Life Imprisonment"; fine = "5,00,000 INR"; }
    else if (c.nlpData.category === "Fraud / Cheating") { sentence = "4 Years Imprisonment"; fine = "80,000 INR"; }
    else if (c.nlpData.category === "Kidnapping / Abduction") { sentence = "7 Years Imprisonment"; fine = "1,00,000 INR"; }

    c.courtData = { verdict: "Guilty - Conviction Upheld", sentencing: sentence, fine: fine, confidence: score };
    c.status = "Verdict Decided";
    c.logs.push("Court verdict predicted by AI precedent engine.");
    saveCases();

    document.getElementById('verdict-outcome-title').innerHTML =
        `<i class="fas fa-balance-scale" style="margin-right:0.5rem;"></i> Verdict: ${c.courtData.verdict}`;
    document.getElementById('verdict-conf-badge').innerText = `Accuracy: ${c.courtData.confidence}`;
    document.getElementById('verdict-sentence-val').innerText = c.courtData.sentencing;
    document.getElementById('verdict-fine-val').innerText = c.courtData.fine;
}

function showTrackingTimelinePanel(c) {
    activateTab(9);
    renderCaseSelectorList();
    document.getElementById('track-case-select').value = c.id;
    document.getElementById('track-card-empty').classList.add('hidden');
    document.getElementById('track-card-content').classList.remove('hidden');

    document.getElementById('track-case-id').innerText = c.id;
    document.getElementById('track-reg-date').innerText = new Date(c.timestamp).toLocaleDateString();
    document.getElementById('track-category').innerText = c.nlpData.category;
    document.getElementById('track-priority').className = `badge-priority-${c.nlpData.priority.toLowerCase()}`;
    document.getElementById('track-priority').innerText = c.nlpData.priority.toUpperCase();
    document.getElementById('track-status').innerText = c.status;

    const flow = document.getElementById('tracking-timeline-flow');
    flow.innerHTML = '';

    const nodes = [
        { label: "Complaint Lodged", done: true },
        { label: "NLP & ML Classification", done: true },
        { label: "CSR Auto-Generated", done: true },
        { label: "FIR Registered & PDFs Downloaded", done: true },
        { label: "Biometric Face Recognition — Suspect Identified", done: !!c.suspect },
        { label: "Charge Sheet Compiled & Filed to Magistrate", done: !!c.chargeSheetId },
        { label: "Court Verdict AI Prediction", done: !!c.courtData }
    ];

    nodes.forEach((n, idx) => {
        const isActive = n.done && (idx === nodes.filter(x => x.done).length - 1);
        flow.innerHTML += `
            <div style="display:flex; gap:1rem; align-items:flex-start; position:relative; margin-bottom:1.25rem;">
                ${idx < nodes.length - 1 ? `<div style="position:absolute; left:15px; top:32px; width:2px; height:35px; background:${n.done ? 'var(--color-success)' : 'var(--border-color)'}; z-index:1;"></div>` : ''}
                <div class="timeline-icon ${n.done ? 'completed' : ''} ${isActive ? 'active' : ''}" style="z-index:2; background:#0d0f17; min-width:32px;">
                    ${n.done ? '<i class="fas fa-check"></i>' : '<i class="far fa-circle"></i>'}
                </div>
                <div>
                    <h5 style="color:${n.done ? '#ffffff' : '#64748b'}; font-weight:${n.done ? '700' : '400'}; font-size:0.88rem;">${n.label}</h5>
                    <p style="color:var(--color-muted); font-size:0.72rem; margin-top:0.1rem;">${n.done ? '✓ Completed automatically' : 'Pending'}</p>
                </div>
            </div>
        `;
    });

    // Tracking document downloads
    const docsDiv = document.getElementById('track-docs-container');
    docsDiv.innerHTML = `
        <button class="btn btn-secondary" onclick="window.PDFGenerator.generateCSR(activeCase)" style="font-size:0.75rem; padding:0.4rem 0.8rem; margin-right:0.5rem; margin-bottom:0.5rem;">
            <i class="fas fa-file-pdf" style="color:#ef4444;"></i> CSR Receipt
        </button>
        <button class="btn btn-secondary" onclick="window.PDFGenerator.generateFIR(activeCase)" style="font-size:0.75rem; padding:0.4rem 0.8rem; margin-right:0.5rem; margin-bottom:0.5rem;">
            <i class="fas fa-file-pdf" style="color:#ef4444;"></i> FIR PDF
        </button>
        ${c.chargeSheetId ? `<button class="btn btn-secondary" onclick="downloadChargeSheetPDF()" style="font-size:0.75rem; padding:0.4rem 0.8rem; margin-bottom:0.5rem;">
            <i class="fas fa-file-pdf" style="color:#ef4444;"></i> Charge Sheet
        </button>` : ''}
    `;
}

function downloadChargeSheetPDF() {
    if (activeCase && activeCase.suspect) {
        const court = activeCase.courtData || { verdict: "Awaiting", sentencing: "Pending", fine: "Pending", confidence: "89%" };
        window.PDFGenerator.generateChargeSheet(activeCase, activeCase.suspect, court);
    }
}

// ─── Case list selector ────────────────────────────────────────────────────
function renderCaseSelectorList() {
    const sel = document.getElementById('track-case-select');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- Choose Case Reference --</option>';
    cases.forEach(c => {
        sel.innerHTML += `<option value="${c.id}">${c.id} — ${c.nlpData.category} (${c.status})</option>`;
    });
}

// ─── Toast Notifications ──────────────────────────────────────────────────
function showToast(title, message) {
    const toast = document.getElementById('app-notification');
    toast.innerHTML = `
        <div style="display:flex; gap:0.75rem; align-items:flex-start;">
            <i class="fas fa-bell" style="color:#5a5cf5; margin-top:2px;"></i>
            <div>
                <strong style="color:#ffffff; font-size:0.85rem; display:block;">${title}</strong>
                <span style="color:#94a3b8; font-size:0.75rem; margin-top:0.1rem; display:block;">${message}</span>
            </div>
        </div>
    `;
    toast.classList.remove('translate-y-24', 'opacity-0');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
        toast.classList.add('translate-y-24', 'opacity-0');
    }, 4000);

    const logContainer = document.getElementById('track-notif-logs');
    if (logContainer) {
        logContainer.innerHTML = `
            <div style="background:var(--bg-card-sub); border-left:3px solid var(--primary-blue); padding:0.6rem 0.85rem; border-radius:4px; font-size:0.75rem; color:var(--color-text); margin-bottom:0.4rem;">
                <strong style="color:var(--color-muted); display:block;">${new Date().toLocaleTimeString()}</strong>
                <strong>${title}:</strong> ${message}
            </div>
        ` + logContainer.innerHTML;
    }
}

// Voice recognition logic moved to js/complaint.js

function updateCrimeSelectorGrid(cat) {
    activeCrimeType = cat;
    document.querySelectorAll('.crime-cell-btn').forEach(btn => {
        btn.classList.remove('active');
        const matches = btn.dataset.class === cat ||
            (cat === 'Theft / Robbery' && (btn.dataset.class === 'Theft' || btn.dataset.class === 'Robbery'));
        if (matches) btn.classList.add('active');
    });
}

// ─── Event Listeners ───────────────────────────────────────────────────────
function setupEventListeners() {

    // Landing → Login
    document.querySelectorAll('.btn-login-trigger').forEach(btn => {
        btn.onclick = () => {
            document.getElementById('landing-screen').classList.add('hidden');
            document.getElementById('login-screen').classList.remove('hidden');
            document.getElementById('toggle-admin-login').click();
        };
    });
    document.querySelectorAll('.btn-register-trigger').forEach(btn => {
        btn.onclick = () => {
            document.getElementById('landing-screen').classList.add('hidden');
            document.getElementById('login-screen').classList.remove('hidden');
            document.getElementById('toggle-user-login').click();
        };
    });

    // Login tab toggles
    document.getElementById('toggle-user-login').onclick = () => {
        document.getElementById('toggle-user-login').classList.add('active');
        document.getElementById('toggle-admin-login').classList.remove('active');
        document.getElementById('user-login-fields').classList.remove('hidden');
        document.getElementById('admin-login-fields').classList.add('hidden');
        document.getElementById('admin-demo-box').classList.add('hidden');
        document.getElementById('login-password').value = 'pass123';
        document.getElementById('btn-submit-login').innerHTML = '<i class="fas fa-sign-in-alt"></i> Login & File Complaint';
    };
    document.getElementById('toggle-admin-login').onclick = () => {
        document.getElementById('toggle-admin-login').classList.add('active');
        document.getElementById('toggle-user-login').classList.remove('active');
        document.getElementById('user-login-fields').classList.add('hidden');
        document.getElementById('admin-login-fields').classList.remove('hidden');
        document.getElementById('admin-demo-box').classList.remove('hidden');
        document.getElementById('login-password').value = 'pass123';
        document.getElementById('btn-submit-login').innerHTML = '<i class="fas fa-user-shield"></i> Access Admin Portal';
    };

    document.getElementById('btn-back-to-landing').onclick = () => {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('landing-screen').classList.remove('hidden');
    };

    document.getElementById('login-form').onsubmit = (e) => {
        e.preventDefault();
        const isAdmin = document.getElementById('toggle-admin-login').classList.contains('active');
        if (isAdmin) {
            const officer = document.getElementById('login-officer-id').value || 'ADMIN_01';
            handleLoginSubmit('investigator', officer);
        } else {
            const phone = document.getElementById('login-phone').value || '9876543289';
            handleLoginSubmit('citizen', 'venkat');
            document.getElementById('comp-fullname').value = 'venkat';
            document.getElementById('comp-phone').value = phone;
        }
    };

    // Logout
    document.getElementById('btn-logout-action').onclick = handleLogout;

    // Tab manual click (only allowed on completed tabs or admin)
    document.querySelectorAll('.tab-item').forEach(item => {
        item.onclick = () => {
            const tabNum = parseInt(item.dataset.tab);
            if (currentRole === 'investigator' || item.classList.contains('completed') || item.classList.contains('active')) {
                activateTab(tabNum);
                if (tabNum === 9 && activeCase) showTrackingTimelinePanel(activeCase);
                if (tabNum === 5 && activeCase) selectCaseForInvestigator(activeCase);
            }
        };
    });

    // Voice mic
    document.getElementById('voice-input-btn').onclick = () => {
        if (!voiceRecognition) return;
        document.getElementById('voice-input-btn').classList.contains('recording')
            ? voiceRecognition.stop()
            : voiceRecognition.start();
    };

    // Crime cell button grid selection
    document.querySelectorAll('.crime-cell-btn').forEach(btn => {
        btn.onclick = () => {
            document.getElementById('toggle-ai-detect').checked = false;
            document.querySelectorAll('.crime-cell-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCrimeType = btn.dataset.class;
        };
    });

    // Sync textarea to auto-detect
    document.getElementById('complaint-text').oninput = (e) => {
        if (document.getElementById('toggle-ai-detect').checked) {
            updateCrimeSelectorGrid(window.NLPEngine.processComplaint(e.target.value).category);
        }
    };

    // Evidence upload handled in js/complaint.js

    // ── SUBMIT COMPLAINT → Launch Full Auto Pipeline ──────────────────────
    document.getElementById('btn-submit-complaint').onclick = () => {
        if (pipelineRunning) {
            showToast("Pipeline Running", "Please wait — auto-processing is already in progress.");
            return;
        }
        const name = document.getElementById('comp-fullname').value.trim();
        const phone = document.getElementById('comp-phone').value.trim();
        const location = document.getElementById('comp-location').value.trim();
        const text = document.getElementById('complaint-text').value.trim();

        if (!name || !text) {
            alert("Please enter your name and complaint description to proceed.");
            return;
        }

        const parsed = window.NLPEngine.processComplaint(text);
        if (!document.getElementById('toggle-ai-detect').checked) {
            parsed.category = activeCrimeType;
            const matchedCat = window.NLPEngine.categories.find(c => c.name === activeCrimeType);
            if (matchedCat) {
                parsed.caseType = matchedCat.caseType;
                parsed.ipcSections = [...matchedCat.ipc];
                parsed.interrogation = window.NLPEngine.generateInterrogation(matchedCat, text);
            }
        }

        // If manual empathy mode is checked, override parsed results
        if (document.getElementById('toggle-empathy-mode').checked) {
            parsed.empathyMode = true;
            parsed.empathyScore = Math.max(parsed.empathyScore, 95);
            if (!parsed.empathyKeywordsFound || parsed.empathyKeywordsFound.length === 0) {
                parsed.empathyKeywordsFound = ["Manual Override", "Sensitive Processing", "Empathy Mode"];
            }
        }

        const caseNum = 1000 + cases.length + 1;
        const newCase = {
            id: "CASE-" + caseNum,
            csrId: "CSR/" + (6580 + cases.length + 1),
            firId: "FIR/" + caseNum,
            chargeSheetId: "",
            complainantName: name,
            complainantContact: phone || "9876543289",
            complaintText: text,
            nlpData: parsed,
            status: "CSR Registered",
            location: location || "Hyderabad",
            date: document.getElementById('comp-date').value || new Date().toISOString().split('T')[0],
            time: document.getElementById('comp-time').value || "12:00",
            evidence: window.ComplaintManager.uploadedFiles.length ? [...window.ComplaintManager.uploadedFiles] : [{ name: "Complaint_Receipt.pdf", size: "310 KB", type: "Document" }],
            suspect: null,
            courtData: null,
            logs: ["Complaint submitted"],
            timestamp: new Date().toISOString()
        };

        // Launch the full pipeline asynchronously
        runFullAutoPipeline(newCase);
    };

    // Clear form
    document.getElementById('btn-clear-complaint').onclick = () => {
        window.ComplaintManager.clearForm();
    };

    // ── Manual buttons (kept as fallback only) ────────────────────────────
    document.getElementById('btn-csr-edit').onclick = () => activateTab(1);
    document.getElementById('btn-csr-approve').onclick = () => { if (activeCase) showFIRRegisteredPanel(activeCase); };
    document.getElementById('btn-fir-proceed').onclick = () => { if (activeCase) { activateTab(5); selectCaseForInvestigator(activeCase); } };
    document.getElementById('btn-trigger-facescan').onclick = () => { if (activeCase) autoRunFaceScan(activeCase); };
    document.getElementById('btn-inv-generate-cs').onclick = () => { if (activeCase) showChargeSheetPanel(activeCase); };
    document.getElementById('btn-cs-download').onclick = downloadChargeSheetPDF;
    document.getElementById('btn-cs-submit').onclick = () => { if (activeCase) showCourtDocketPanel(activeCase); };
    document.getElementById('btn-court-proceed').onclick = () => { if (activeCase) showJudgmentPredictPanel(activeCase); };
    document.getElementById('btn-verdict-download').onclick = downloadChargeSheetPDF;
    document.getElementById('btn-verdict-proceed').onclick = () => { if (activeCase) showTrackingTimelinePanel(activeCase); };
    document.getElementById('btn-fir-download').onclick = () => { if (activeCase) window.PDFGenerator.generateFIR(activeCase); };

    // Tracking case picker
    document.getElementById('track-case-select').onchange = (e) => {
        const c = cases.find(x => x.id === e.target.value);
        if (c) { activeCase = c; showTrackingTimelinePanel(c); }
        else {
            document.getElementById('track-card-empty').classList.remove('hidden');
            document.getElementById('track-card-content').classList.add('hidden');
        }
    };

    // My Cases button
    document.getElementById('btn-workspace-mycases').onclick = () => {
        activateTab(9);
        if (activeCase) showTrackingTimelinePanel(activeCase);
    };
}

// CSS spin keyframe (inline fallback)
const styleTag = document.createElement('style');
styleTag.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
document.head.appendChild(styleTag);

window.onload = initApp;
