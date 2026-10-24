/**
 * Biometric Face Recognition Simulator
 * Simulates face scanning, feature mapping, database comparison, and identity prediction.
 */

const FaceRecScanner = {
    suspectDatabase: [
        {
            id: "sus_001",
            name: "Rajesh Kumar",
            alias: "Bunty",
            gender: "Male",
            age: 34,
            records: ["Theft (2023)", "Burglary (2024)"],
            status: "Wanted",
            baseConfidence: 94.8,
            photoSeed: "rajesh"
        },
        {
            id: "sus_002",
            name: "Vikram Singh",
            alias: "Vicky",
            gender: "Male",
            age: 29,
            records: ["Assault (2022)", "Extortion (2025)"],
            status: "Wanted",
            baseConfidence: 91.2,
            photoSeed: "vikram"
        },
        {
            id: "sus_003",
            name: "Pooja Sharma",
            alias: "Payal",
            gender: "Female",
            age: 26,
            records: ["Cyber Fraud (2024)", "Identity Cheating (2025)"],
            status: "Active Surveillance",
            baseConfidence: 96.5,
            photoSeed: "pooja"
        },
        {
            id: "sus_004",
            name: "Amit Patel",
            alias: "Dada",
            gender: "Male",
            age: 42,
            records: ["Financial Fraud (2021)", "Money Laundering (2023)"],
            status: "Absconding",
            baseConfidence: 88.9,
            photoSeed: "amit"
        }
    ],

    // Function to run a scanning animation on a canvas
    startScan: function(canvasId, imageSrc, callback) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = imageSrc;

        img.onload = () => {
            canvas.width = 400;
            canvas.height = 300;
            
            let scanY = 0;
            let direction = 1;
            let duration = 2500; // 2.5 seconds scanning
            let start = null;

            // Pre-defined relative face nodes for simulation box
            const boxX = 130;
            const boxY = 60;
            const boxW = 140;
            const boxH = 160;

            const nodes = [
                {x: 170, y: 110}, // Left eye
                {x: 230, y: 110}, // Right eye
                {x: 200, y: 150}, // Nose
                {x: 200, y: 190}, // Mouth
                {x: 150, y: 200}, // Left jaw
                {x: 250, y: 200}  // Right jaw
            ];

            function animateScan(timestamp) {
                if (!start) start = timestamp;
                let elapsed = timestamp - start;

                // Draw base photo
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Add dark overlay
                ctx.fillStyle = "rgba(10, 15, 30, 0.4)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Update scan line position
                scanY += (canvas.height / 50) * direction;
                if (scanY >= canvas.height || scanY <= 0) {
                    direction *= -1;
                }

                // Draw facial target boundary box
                ctx.strokeStyle = "rgba(0, 242, 254, 0.8)";
                ctx.lineWidth = 2;
                ctx.strokeRect(boxX, boxY, boxW, boxH);

                // Target box corners
                const cornerLength = 15;
                ctx.strokeStyle = "rgba(0, 242, 254, 1)";
                ctx.lineWidth = 4;
                
                // Top-Left
                ctx.beginPath();
                ctx.moveTo(boxX, boxY + cornerLength); ctx.lineTo(boxX, boxY); ctx.lineTo(boxX + cornerLength, boxY); ctx.stroke();
                // Top-Right
                ctx.beginPath();
                ctx.moveTo(boxX + boxW - cornerLength, boxY); ctx.lineTo(boxX + boxW, boxY); ctx.lineTo(boxX + boxW, boxY + cornerLength); ctx.stroke();
                // Bottom-Left
                ctx.beginPath();
                ctx.moveTo(boxX, boxY + boxH - cornerLength); ctx.lineTo(boxX, boxY + boxH); ctx.lineTo(boxX + cornerLength, boxY + boxH); ctx.stroke();
                // Bottom-Right
                ctx.beginPath();
                ctx.moveTo(boxX + boxW - cornerLength, boxY + boxH); ctx.lineTo(boxX + boxW, boxY + boxH); ctx.lineTo(boxX + boxW, boxY + boxH - cornerLength); ctx.stroke();

                // Draw landmark nodes and connecting lines if partially through scan
                if (elapsed > 500) {
                    ctx.strokeStyle = "rgba(0, 242, 254, 0.3)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(nodes[0].x, nodes[0].y);
                    nodes.forEach(n => ctx.lineTo(n.x, n.y));
                    ctx.closePath();
                    ctx.stroke();

                    nodes.forEach((n, idx) => {
                        ctx.fillStyle = elapsed % 600 > 300 ? "rgba(0, 242, 254, 0.9)" : "rgba(255, 211, 29, 0.9)";
                        ctx.beginPath();
                        ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.font = "8px monospace";
                        ctx.fillStyle = "#ffffff";
                        ctx.fillText(`P-${idx}`, n.x + 6, n.y + 3);
                    });
                }

                // Draw glowing scanline
                ctx.strokeStyle = "rgba(0, 242, 254, 0.9)";
                ctx.shadowColor = "rgba(0, 242, 254, 0.8)";
                ctx.shadowBlur = 10;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, scanY);
                ctx.lineTo(canvas.width, scanY);
                ctx.stroke();
                
                // Reset shadow properties for other drawings
                ctx.shadowBlur = 0;

                // Add grid matrix scanner overlays
                ctx.font = "9px monospace";
                ctx.fillStyle = "rgba(0, 242, 254, 0.5)";
                ctx.fillText(`SCANNING BIOMETRICS: ${(elapsed/duration*100).toFixed(0)}%`, 15, 20);
                ctx.fillText("MATRIX: OK", 15, 35);
                ctx.fillText(`CHANNELS: RGB-EVAL`, 15, 50);

                if (elapsed < duration) {
                    requestAnimationFrame(animateScan);
                } else {
                    // Scanning Complete! Draw final analysis UI
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    ctx.strokeStyle = "rgba(0, 255, 127, 0.9)";
                    ctx.strokeRect(boxX, boxY, boxW, boxH);
                    
                    // Match found graphic
                    ctx.fillStyle = "rgba(0, 255, 127, 0.2)";
                    ctx.fillRect(boxX, boxY, boxW, boxH);
                    ctx.fillStyle = "#00ff7f";
                    ctx.font = "bold 14px monospace";
                    ctx.fillText("MATCH CONFIRMED", boxX + 10, boxY + 25);
                    
                    // Call the callback to return matching data
                    if (callback) {
                        callback();
                    }
                }
            }

            requestAnimationFrame(animateScan);
        };
    },

    // Query DB and returns a randomized match close to high accuracy constraints
    findMatch: function(category) {
        let matchSuspect = this.suspectDatabase[0]; // Default Rajesh

        if (category.includes("Assault")) {
            matchSuspect = this.suspectDatabase[1]; // Vikram
        } else if (category.includes("Cyber") || category.includes("Harassment")) {
            matchSuspect = this.suspectDatabase[2]; // Pooja
        } else if (category.includes("Fraud")) {
            matchSuspect = this.suspectDatabase[3]; // Amit
        }

        const matchConfidence = (matchSuspect.baseConfidence + (Math.random() * 3)).toFixed(1);

        return {
            suspect: matchSuspect,
            confidence: matchConfidence + "%",
            processingTimeMs: (100 + Math.random() * 200).toFixed(0),
            scanStatus: "Match Located",
            hashKey: "F-REC_" + Math.random().toString(36).substr(2, 9).toUpperCase()
        };
    }
};

window.FaceRecScanner = FaceRecScanner;
