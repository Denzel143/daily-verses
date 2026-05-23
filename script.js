document.addEventListener("DOMContentLoaded", () => {
    const verseTextEl = document.getElementById("verse-text");
    const verseRefEl = document.getElementById("verse-ref");
    const dateEl = document.getElementById("current-date");
    const shuffleBtn = document.getElementById("shuffle-btn");
    const copyBtn = document.getElementById("copy-btn");
    const saveImgBtn = document.getElementById("save-img-btn");
    const toast = document.getElementById("toast");

    let activeVerseText = "";
    let activeVerseRef = "";

    // Set tanggal harian lokal
    const todayStr = new Date().toLocaleDateString('id-ID', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    const todayKey = new Date().toLocaleDateString('id-ID');

    dateEl.textContent = todayStr;

    // Cek LocalStorage
    const savedDate = localStorage.getItem("ayatHarianTanggal");
    const savedVerse = localStorage.getItem("ayatHarianTeks");
    const savedRef = localStorage.getItem("ayatHarianRef");

    if (savedDate === todayKey && savedVerse && savedRef) {
        displayVerse(savedVerse, savedRef);
    } else {
        fetchNewDailyVerse(todayKey);
    }

    function displayVerse(text, reference) {
        activeVerseText = text;
        activeVerseRef = reference;
        verseTextEl.textContent = `"${text}"`;
        verseRefEl.textContent = `- ${reference} -`;
    }

    async function fetchNewDailyVerse(dateKey) {
        try {
            const response = await fetch('database_alkitab_v2.bin');
            if (!response.ok) throw new Error("Gagal memuat database Alkitab");
            const db = await response.json();

            const allBooks = [...(db.PL || []), ...(db.PB || [])];

            const recommendedBooks = [
                "Mazmur", "Amsal", "Pengkhotbah", "Yesaya", "Yeremia", "Ratapan", 
                "Matius", "Markus", "Lukas", "Yohanes", "Roma", "1 Korintus", "2 Korintus", 
                "Galatia", "Efesus", "Filipi", "Kolose", "1 Tesalonika", "2 Tesalonika", 
                "1 Timotius", "2 Timotius", "Titus", "Ibrani", "Yakobus", "1 Petrus", 
                "2 Petrus", "1 Yohanes", "Yudas", "Wahyu"
            ];

            const avoidStartWords = ["dan", "lalu", "kemudian", "maka", "tetapi", "adapun", "sebab itu", "karena itu", "ketika", "pada waktu"];

            let validVerseFound = false;
            let attempts = 0;
            let selectedVerse = "";
            let selectedRef = "";

            while (!validVerseFound && attempts < 200) {
                attempts++;
                
                const randomBookName = recommendedBooks[Math.floor(Math.random() * recommendedBooks.length)];
                const book = allBooks.find(b => b.name === randomBookName);
                if (!book) continue;

                const chapter = book.chapters[Math.floor(Math.random() * book.chapters.length)];
                if (!chapter || !chapter.verses.length) continue;
                
                const verse = chapter.verses[Math.floor(Math.random() * chapter.verses.length)];
                const text = verse.text.trim();
                const textLower = text.toLowerCase();

                const isGoodLength = text.length > 60 && text.length < 230;
                const isStandalone = !avoidStartWords.some(word => textLower.startsWith(word + " "));
                const isFinishedSentence = !text.endsWith(",") && !text.endsWith(";") && !text.endsWith(":");

                if (isGoodLength && isStandalone && isFinishedSentence) {
                    selectedVerse = text;
                    selectedRef = `${book.name} ${chapter.number}:${verse.number}`;
                    validVerseFound = true;
                }
            }

            if (!validVerseFound) {
                selectedVerse = "Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman TUHAN, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.";
                selectedRef = "Yeremia 29:11";
            }

            localStorage.setItem("ayatHarianTanggal", dateKey);
            localStorage.setItem("ayatHarianTeks", selectedVerse);
            localStorage.setItem("ayatHarianRef", selectedRef);

            displayVerse(selectedVerse, selectedRef);

        } catch (error) {
            console.error(error);
            verseTextEl.textContent = "Gagal memuat ayat. Jalankan berkas ini melalui local web server.";
            verseRefEl.textContent = "";
        }
    }

    // --- FITUR BARU: ACAK ULANG AYAT ---
    shuffleBtn.addEventListener("click", () => {
        // Efek animasi ikon putar
        const icon = shuffleBtn.querySelector('i');
        icon.classList.add('spin');
        setTimeout(() => icon.classList.remove('spin'), 500);

        // Ubah teks sementara saat sedang diproses
        verseTextEl.textContent = "Mengacak ayat baru...";
        verseRefEl.textContent = "";

        // Panggil fungsi undi ulang
        fetchNewDailyVerse(todayKey);
    });

    // --- FITUR: SALIN AYAT ---
    copyBtn.addEventListener("click", () => {
        if (!activeVerseText) return;
        
        const textToCopy = `"${activeVerseText}"\n\n— ${activeVerseRef}`;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 2500);
        }).catch(err => {
            console.error("Gagal menyalin ayat: ", err);
        });
    });

    // --- FITUR: SIMPAN SEBAGAI GAMBAR ---
    saveImgBtn.addEventListener("click", () => {
        if (!activeVerseText) return;

        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext("2d");

        const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
        gradient.addColorStop(0, '#4e54c8');
        gradient.addColorStop(1, '#8f94fb');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1080, 1080);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 15;
        ctx.strokeRect(50, 50, 980, 980);

        ctx.font = '500px Georgia';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('“', 540, 600);

        const dateObj = new Date();
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const dayName = days[dateObj.getDay()];
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const yy = String(dateObj.getFullYear()).slice(-2);
        const yyyy = dateObj.getFullYear();
        
        const dynamicTitle = `Nats ${dayName}, ${dd}-${mm}-${yy}`;

        ctx.font = 'bold 32px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.textBaseline = 'top';
        ctx.fillText(dynamicTitle, 540, 120);

        const titleWidth = ctx.measureText(dynamicTitle).width;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(540 - (titleWidth / 2), 175, titleWidth, 4);

        ctx.font = 'italic 40px Georgia'; 
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'middle';
        
        const maxWidth = 820;
        const lineHeight = 65;
        const words = `"${activeVerseText}"`.split(' ');
        let lines = [];
        let currentLine = '';

        for (let n = 0; n < words.length; n++) {
            let testLine = currentLine + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                lines.push(currentLine.trim());
                currentLine = words[n] + ' ';
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine.trim());

        const totalTextHeight = lines.length * lineHeight;
        let startY = 540 - (totalTextHeight / 2);
        if (startY < 260) startY = 260;

        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], 540, startY);
            startY += lineHeight;
        }

        const refY = startY + 40; 
        ctx.font = 'bold 34px sans-serif';
        ctx.fillStyle = '#ffe066'; 
        ctx.fillText(`— ${activeVerseRef} —`, 540, refY);

        const formattedDate = `${dd}-${mm}-${yyyy}`;
        const formattedRef = activeVerseRef.replace(/[: ]/g, '-');
        const finalFileName = `Nats_${formattedDate}_${formattedRef}.png`;

        const link = document.createElement('a');
        link.download = finalFileName;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});
