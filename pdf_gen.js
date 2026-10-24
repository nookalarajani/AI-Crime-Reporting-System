/**
 * PDF Document Compiler
 * Employs jsPDF to generate community service registers, FIRs, and official charge sheets.
 * Supports both Criminal (IPC) and Civil (CPC) document formats dynamically.
 */

const PDFGenerator = {
    // Utility to draw a beautiful header
    drawHeader: function(doc, title, caseId) {
        // Draw decorative borders
        doc.setDrawColor(26, 80, 255); // Neon Police/Justice Blue
        doc.setLineWidth(2);
        doc.rect(5, 5, 200, 287); // Page border
        
        doc.setDrawColor(120, 120, 120);
        doc.setLineWidth(0.5);
        doc.rect(7, 7, 196, 283);
 
        // Header Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.setTextColor(26, 80, 255);
        doc.text("DEPARTMENT OF LAW, ENFORCEMENT & JUSTICE", 105, 20, { align: "center" });
 
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text("GOVERNMENT OF NATIONAL JURISDICTION", 105, 26, { align: "center" });
 
        // Divider
        doc.setDrawColor(26, 80, 255);
        doc.setLineWidth(1.5);
        doc.line(15, 32, 195, 32);
 
        // Document Title Box
        doc.setFillColor(230, 235, 255);
        doc.rect(15, 36, 180, 10, "F");
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(title, 105, 42, { align: "center" });
 
        // Meta (Date and Case ID)
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Reference ID: ${caseId || 'N/A'}`, 18, 54);
        doc.text(`Generated Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 130, 54);
 
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(15, 58, 195, 58);
    },
 
    // Utility to draw footer with signature fields
    drawFooter: function(doc, signatureLabel) {
        const pageHeight = doc.internal.pageSize.height;
 
        // Stamp and Signature space
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        
        doc.text("Official System Stamp", 35, pageHeight - 35);
        doc.setDrawColor(180, 180, 180);
        doc.rect(20, pageHeight - 50, 50, 20); // stamp box
        doc.setFontSize(7);
        doc.text("AUTOMATED VERIFIED", 23, pageHeight - 40);
 
        doc.setFontSize(9);
        doc.text(signatureLabel || "Authorized Signature", 140, pageHeight - 25);
        doc.line(130, pageHeight - 30, 190, pageHeight - 30); // signature line
 
        // Bottom disclaimer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("This is an AI-assisted electronically generated document under IT Act Sec 65B.", 105, pageHeight - 10, { align: "center" });
    },
 
    // Generates Community Service Register (CSR / CDR)
    generateCSR: function(caseData) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const isCivil = caseData.nlpData.caseType === "civil";
 
        const docTitle = isCivil ? "CIVIL DISPUTE REGISTER (CDR) REPORT" : "COMMUNITY SERVICE REGISTER (CSR) REPORT";
        const docId = isCivil ? caseData.csrId.replace("CSR/", "CDR/") : caseData.csrId;
 
        this.drawHeader(doc, docTitle, docId);
 
        // Complainant Details section
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(26, 80, 255);
        doc.text("1. FILING PARTY INFORMATION", 18, 67);
 
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
 
        let y = 74;
        doc.text(`Name: ${caseData.complainantName}`, 20, y);
        doc.text(`Age Group: ${caseData.nlpData.ageCategory} (${caseData.nlpData.detectedAge || 'Not Stated'})`, 110, y);
        
        y += 7;
        doc.text(`Contact: ${caseData.complainantContact || '9876543210'}`, 20, y);
        doc.text(`Submission Mode: Electronic Web Portal`, 110, y);
 
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(26, 80, 255);
        doc.text(isCivil ? "2. DISPUTE DESCRIPTION & CLAIMS" : "2. COMPLAINT DESCRIPTION", 18, y);
 
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        
        y += 7;
        // Wrap description text
        const splitText = doc.splitTextToSize(caseData.complaintText, 170);
        doc.text(splitText, 20, y);
        
        y += (splitText.length * 5) + 5;
 
        doc.setFont("helvetica", "bold");
        doc.setTextColor(26, 80, 255);
        doc.text("3. AUTOMATED NLP ANALYSIS & TRIAGE", 18, y);
 
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        y += 7;
        doc.text(`Incident Category: ${caseData.nlpData.category}`, 20, y);
        doc.text(`Triage Priority Rank: ${caseData.nlpData.priority}`, 110, y);
        
        y += 7;
        doc.text(`NLP Processing Latency: ${caseData.nlpData.latencyMs} ms`, 20, y);
        doc.text(`System Accuracy Confidence: ${caseData.nlpData.metrics.confidence}`, 110, y);
 
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(26, 80, 255);
        doc.text(isCivil ? "4. RECOMMENDED CPC CODE/RULE CLASSIFICATION" : "4. RECOMMENDED IPC SECTION CLASSIFICATION", 18, y);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        
        caseData.nlpData.ipcSections.forEach((sec) => {
            y += 7;
            doc.setFont("helvetica", "bold");
            doc.text(`${sec.section}: `, 20, y);
            doc.setFont("helvetica", "normal");
            doc.text(sec.description, 55, y);
        });
 
        this.drawFooter(doc, isCivil ? "Dispute Registrar / Citizen Portal" : "Duty Officer / Citizen Portal");
        doc.save(`${docId.replace("/", "_")}.pdf`);
    },
 
    // Generates First Information Report (FIR / CDA)
    generateFIR: function(caseData) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const isCivil = caseData.nlpData.caseType === "civil";
 
        const docTitle = isCivil ? "CIVIL DISPUTE APPLICATION (CDA)" : "FIRST INFORMATION REPORT (FIR)";
        const docId = isCivil ? caseData.firId.replace("FIR/", "CDA/") : caseData.firId;
        const linkId = isCivil ? caseData.csrId.replace("CSR/", "CDR/") : caseData.csrId;
 
        this.drawHeader(doc, docTitle, docId);
 
        let y = 67;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(26, 80, 255);
        doc.text("1. JURISDICTION & BRANCH DETAILS", 18, y);
 
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        y += 7;
        doc.text(isCivil ? "Filing Office: Sector-12 Civil Disputes Branch" : "Police Station: Sector-12 Cyber & Crime Branch", 20, y);
        doc.text(`District Court Area: Metro West`, 110, y);
 
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(26, 80, 255);
        doc.text("2. REGISTRATION DETAILS", 18, y);
 
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        y += 7;
        doc.text(`Filing Ref ID: ${docId}`, 20, y);
        doc.text(`Associated Registry ID: ${linkId}`, 110, y);
        
        y += 7;
        doc.text(isCivil ? "Statutory CPC Rules Applied:" : "IPC Act & Sections Applied:", 20, y);
        let secStr = caseData.nlpData.ipcSections.map(s => s.section).join(", ");
        doc.setFont("helvetica", "bold");
        doc.text(secStr, 75, y);
 
        doc.setFont("helvetica", "normal");
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(26, 80, 255);
        doc.text("3. LITIGANT MATRIX", 18, y);
 
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        y += 7;
        doc.text(`Complainant/Petitioner: ${caseData.complainantName}`, 20, y);
        doc.text(`Age Status: ${caseData.nlpData.ageCategory}`, 110, y);
 
        y += 7;
        doc.text(isCivil ? `Respondent Details: ${caseData.suspectDetails || 'Pending Summons Delivery'}` : `Suspect Details: ${caseData.suspectDetails || 'Unknown / Under Investigation'}`, 20, y);
        doc.text(`Case Priority Rank: ${caseData.nlpData.priority}`, 110, y);
 
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(26, 80, 255);
        doc.text("4. FACTUAL SUMMARY & NLP ARGUMENTS", 18, y);
 
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        y += 7;
        const splitText = doc.splitTextToSize(caseData.complaintText, 170);
        doc.text(splitText, 20, y);
        y += (splitText.length * 5) + 5;
 
        doc.setFont("helvetica", "bold");
        doc.setTextColor(26, 80, 255);
        doc.text(isCivil ? "5. ARBITRATION / MEDIATION BRIEF DIRECTION" : "5. INVESTIGATION BRIEF DIRECTION", 18, y);
 
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        y += 7;
        doc.text(isCivil ? "Assigned Officer: Registrar Srinivas Rao" : "Assigned Officer: Inspector Kumar Swamy", 20, y);
        doc.text(isCivil ? "Action Directive: Document Verification and Pre-Trial Mediation" : "Action Directive: Biometric evidence scan and CCTV collection", 110, y);
 
        this.drawFooter(doc, isCivil ? "Civil Registrar Officer" : "Station House Officer (SHO)");
        doc.save(`${docId.replace("/", "_")}.pdf`);
    },
 
    // Generates final Legal Charge Sheet (or Plaint Docket)
    generateChargeSheet: function(caseData, suspectData, courtData) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const isCivil = caseData.nlpData.caseType === "civil";
 
        const docTitle = isCivil ? "OFFICIAL CIVIL PLAINT DOCKET (CPC)" : "OFFICIAL CRIMINAL CHARGE SHEET";
        const chargeSheetId = isCivil ? "CP-" + caseData.firId.replace("FIR/", "") : "CS-" + caseData.firId.replace("FIR/", "");
        
        // PAGE 1: Case Details
        this.drawHeader(doc, docTitle, chargeSheetId);
 
        let y = 67;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(26, 80, 255);
        doc.text("1. ASSOCIATED CASE & FIR DETAILS", 18, y);
 
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        y += 7;
        const firDetailsText = isCivil 
            ? `${caseData.firId.replace("FIR/", "CDA/")} (Registered on ${new Date(caseData.timestamp).toLocaleDateString()} under CDR ID: ${caseData.csrId.replace("CSR/", "CDR/")})`
            : `${caseData.firId} (Registered on ${new Date(caseData.timestamp).toLocaleDateString()} under CSR ID: ${caseData.csrId})`;
        doc.text(firDetailsText, 20, y);
 
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(26, 80, 255);
        doc.text("2. COMPLAINANT & VICTIM INFORMATION", 18, y);
 
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        y += 7;
        doc.text(`Complainant Name: ${caseData.complainantName} (Phone: ${caseData.complainantContact})`, 20, y);
        y += 7;
        doc.text(`Victim Name: ${caseData.complainantName} (Age Group: ${caseData.nlpData.ageCategory})`, 20, y);
 
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(26, 80, 255);
        doc.text(isCivil ? "3. RESPONDENT PROFILE & STATUS" : "3. ACCUSED PROFILE & STATUS", 18, y);
 
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        y += 7;
        const nameVal = suspectData ? suspectData.name : "Under Investigation";
        const aliasVal = suspectData ? (suspectData.alias || "None") : "N/A";
        const statusVal = suspectData ? (suspectData.status || "Wanted") : "Pending Scan";
        doc.text(`Identified Accused: ${nameVal} (Alias: ${aliasVal})`, 20, y);
        y += 7;
        doc.text(`Current Accused Status: ${statusVal}`, 20, y);
 
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(26, 80, 255);
        doc.text(isCivil ? "4. STATUTORY CIVIL LAWS & CPC CODES" : "4. SPECIFIC CHARGES & APPLICABLE IPC CODES", 18, y);
 
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        caseData.nlpData.ipcSections.forEach((sec) => {
            y += 7;
            doc.setFont("helvetica", "bold");
            doc.text(`${sec.section}: `, 20, y);
            doc.setFont("helvetica", "normal");
            doc.text(sec.description, 55, y);
        });
 
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(26, 80, 255);
        doc.text("5. COMPLAINT / INCIDENT DESCRIPTION", 18, y);
 
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        y += 7;
        const splitText = doc.splitTextToSize(caseData.complaintText, 170);
        doc.text(splitText, 20, y);
 
        // Draw page 1 footer
        this.drawFooter(doc, isCivil ? "Registrar Office Seal" : "Station House Seal");
 
        // PAGE 2: Investigation & Findings
        doc.addPage();
        this.drawHeader(doc, docTitle, chargeSheetId);
 
        y = 67;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(26, 80, 255);
        doc.text("6. KEY INVESTIGATION FINDINGS", 18, y);
 
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        y += 7;
        const findingsText = isCivil
            ? 'Documentary chain check completed. Property registry deeds verified. Survey maps cross-referenced with Municipal authorities. No legal stay orders active.'
            : 'CCTV timeline compiled. Biometric facial matching confirmed suspect presence at the scene. Disputed mobile IMEI traces locate transaction patterns.';
        doc.text(doc.splitTextToSize(findingsText, 170), 20, y);
 
        y += 15;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(26, 80, 255);
        doc.text("7. EVIDENCE DETAILS & SEIZED MATERIALS", 18, y);
 
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        y += 7;
        const evidenceText = isCivil
            ? 'Exhibit-A: Certified Land Agreement Copies. Exhibit-B: Signed payment transaction receipt logs.'
            : 'Exhibit-1: Face Recognition biometric audit report. Exhibit-2: CCTV Frame Sequence 24-B. Exhibit-3: Signed Witness logs.';
        doc.text(evidenceText, 20, y);
        y += 7;
        const seizedText = isCivil
            ? 'Seized Materials: Property Title Registry prints, bank clearance records.'
            : 'Seized Materials: Stolen cellular device recovered from suspect possession, digital logs clone.';
        doc.text(seizedText, 20, y);
 
        y += 12;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(26, 80, 255);
        doc.text("8. WITNESS LIST & RECORDED STATEMENTS", 18, y);
 
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        y += 7;
        if (isCivil) {
            doc.text('1. Ramesh Kumar (Property Broker): "Stated partition was done in his presence."', 20, y);
            y += 6;
            doc.text('2. Suresh Lal (Neighbor): "Confirmed boundaries were altered on the 12th."', 20, y);
        } else {
            doc.text('1. Inspector Kumar Swamy: "Accused apprehended with the stolen property in possession."', 20, y);
            y += 6;
            doc.text('2. Suresh Sen (Shopkeeper): "Confirmed seeing the suspect near the victim."', 20, y);
        }
 
        y += 12;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(26, 80, 255);
        doc.text("9. MEDICAL / FORENSIC / AUDIT REPORTS", 18, y);
 
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        y += 7;
        const forensicText = isCivil
            ? 'Forensic Handwriting Analysis: Signature matches official registry copies with 98% congruence.'
            : 'Biometric Fingerprint Match: 99.2% match with suspect records. Cyber forensic SHA-256 verified.';
        doc.text(forensicText, 20, y);
 
        y += 12;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(26, 80, 255);
        doc.text("10. FINAL INVESTIGATION CONCLUSION", 18, y);
 
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        y += 7;
        const conclusionText = isCivil
            ? 'The respondent breached contract agreements. Encroachment detected. Recommended restitution of property to plaintiff.'
            : 'Sufficient evidence exists to prosecute the accused under the specified legal sections. Court trial proceedings recommended.';
        doc.text(doc.splitTextToSize(conclusionText, 170), 20, y);
 
        this.drawFooter(doc, isCivil ? "Arbitrator / Registrar Signature" : "Investigating Officer / Prosecutor");
        doc.save(`${chargeSheetId}_ChargeSheet.pdf`);
    }
};
 
window.PDFGenerator = PDFGenerator;
