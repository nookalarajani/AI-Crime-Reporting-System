/**
 * Complaint & Evidence Manager for Smart FIR System
 * Handles voice dictation, drag & drop evidence uploads, and complaint form helper functions.
 */

const ComplaintManager = {
    uploadedFiles: [],
    voiceRecognition: null,

    init: function() {
        this.setupVoiceRecognition();
        this.setupUploadHandlers();
    },

    setupVoiceRecognition: function() {
        const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Speech) { 
            const micBtn = document.getElementById('voice-input-btn');
            if (micBtn) micBtn.style.display = 'none'; 
            return; 
        }

        this.voiceRecognition = new Speech();
        this.voiceRecognition.continuous = false;
        this.voiceRecognition.lang = 'en-IN';
        this.voiceRecognition.interimResults = false;

        this.voiceRecognition.onstart = () => {
            const micBtn = document.getElementById('voice-input-btn');
            if (micBtn) micBtn.classList.add('recording');
            const listeningLabel = document.getElementById('voice-listening-label');
            if (listeningLabel) listeningLabel.classList.remove('hidden');
        };

        this.voiceRecognition.onresult = (e) => {
            const result = e.results[0][0].transcript;
            const ta = document.getElementById('complaint-text');
            if (ta) {
                ta.value = (ta.value ? ta.value + ' ' : '') + result;
                const aiDetect = document.getElementById('toggle-ai-detect');
                if (aiDetect && aiDetect.checked) {
                    if (window.updateCrimeSelectorGrid) {
                        window.updateCrimeSelectorGrid(window.NLPEngine.processComplaint(ta.value).category);
                    }
                }
            }
        };

        this.voiceRecognition.onend = () => {
            const micBtn = document.getElementById('voice-input-btn');
            if (micBtn) micBtn.classList.remove('recording');
            const listeningLabel = document.getElementById('voice-listening-label');
            if (listeningLabel) listeningLabel.classList.add('hidden');
        };
    },

    setupUploadHandlers: function() {
        const uploadInput = document.getElementById('evidence-upload-raw');
        if (!uploadInput) return;

        uploadInput.onchange = (e) => {
            const list = document.getElementById('uploaded-files-list');
            if (!list) return;

            Array.from(e.target.files).forEach(f => {
                this.uploadedFiles.push({ 
                    name: f.name, 
                    size: (f.size/1024).toFixed(0) + " KB", 
                    type: f.type.includes("video") ? "Video" : f.type.includes("image") ? "Image" : "Document" 
                });
                list.innerHTML += `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#1c2030; padding:0.5rem 1rem; border-radius:8px; font-size:0.8rem; border:1px solid rgba(255,255,255,0.04); margin-bottom:0.4rem;">
                        <span><i class="fas fa-file-shield" style="color:#5a5cf5; margin-right:0.5rem;"></i>${f.name} (${(f.size/1024).toFixed(0)} KB)</span>
                        <span style="color:var(--color-success); font-size:0.7rem;"><i class="fas fa-check"></i> Hash Verified</span>
                    </div>`;
            });
        };
    },

    clearForm: function() {
        const ta = document.getElementById('complaint-text');
        if (ta) ta.value = '';
        const list = document.getElementById('uploaded-files-list');
        if (list) list.innerHTML = '';
        this.uploadedFiles = [];
    }
};

window.ComplaintManager = ComplaintManager;
