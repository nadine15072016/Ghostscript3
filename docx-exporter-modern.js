// docx-exporter-modern.js
// Menggunakan docx.js untuk ekspor Word yang valid, termasuk data dan foto
// Pastikan file ini di-include di index.html setelah docx library


async function exportLaporanToWord() {
    if (!window.docx) {
        alert('Library docx.js gagal dimuat. Pastikan koneksi internet aktif dan script CDN tidak diblokir.');
        return;
    }
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun } = window.docx;
    try {
        // Ambil data dari halaman
        const judul = document.querySelector('.judul-laporan')?.innerText || '';
        const identitasRows = Array.from(document.querySelectorAll('#form-identitas .identitas tr'));
        const tableRows = Array.from(document.querySelectorAll('#table-body tr'));

        // Buat dokumen
        const docChildren = [
            new Paragraph({
                children: [new TextRun({ text: judul, bold: true, size: 28 })],
                alignment: 'center',
            }),
            new Paragraph({ text: '' }),
            // Identitas
            ...identitasRows.map(row => {
                const tds = row.querySelectorAll('td');
                let value = '';
                if (tds[2]) {
                    const input = tds[2].querySelector('input,textarea');
                    value = input ? input.value : tds[2].innerText;
                }
                return new Paragraph({
                    children: [
                        new TextRun({ text: (tds[0]?.innerText || '') + ' ', bold: true }),
                        new TextRun({ text: value })
                    ]
                });
            }),
            new Paragraph({ text: '' })
        ];

        // Tabel Eviden
        const tableHeader = new TableRow({
            children: [
                new TableCell({ children: [new Paragraph('TANGGAL')] }),
                new TableCell({ children: [new Paragraph('Judul Konten')] }),
                new TableCell({ children: [new Paragraph('Like')] }),
                new TableCell({ children: [new Paragraph('Comen')] }),
                new TableCell({ children: [new Paragraph('Share')] }),
            ]
        });

        // Ambil foto dari IndexedDB
        async function getFotoBase64(key) {
            if (window.idbGetFoto) {
                try {
                    const dataUrl = await window.idbGetFoto(key);
                    return dataUrl;
                } catch (e) { return null; }
            }
            return null;
        }

        // Helper untuk gambar (didefinisikan setelah doc dibuat)
        let doc;
        function imgCell(base64, tipe, idx) {
            try {
                if (base64 && typeof base64 === 'string' && base64.startsWith('data:image')) {
                    // Convert base64 to Uint8Array
                    const arr = base64.split(",");
                    let mime = arr[0].match(/:(.*?);/)[1];
                    let bstr = atob(arr[1]);
                    let n = bstr.length;
                    let u8arr = new Uint8Array(n);
                    while(n--){
                        u8arr[n] = bstr.charCodeAt(n);
                    }
                    return new TableCell({ children: [
                        new Paragraph({
                            children: [
                                new ImageRun({
                                    data: u8arr,
                                    transformation: { width: 180, height: 180 }
                                })
                            ]
                        })
                    ] });
                } else {
                    if (base64 && base64.length > 0) {
                        console.error('Format foto tidak valid untuk ekspor:', tipe, idx, base64.slice(0,30));
                        alert('Foto eviden ('+tipe+' baris '+idx+') gagal diekspor. Pastikan file gambar valid.');
                    }
                }
            } catch(e) {
                console.error('Gagal menambah gambar ke Word:', tipe, idx, e);
                alert('Foto eviden ('+tipe+' baris '+idx+') gagal diekspor. Error: '+e);
            }
            return new TableCell({ children: [new Paragraph('')] });
        }

        const tableBodyRows = [];
        for (const tr of tableRows) {
            const tds = tr.querySelectorAll('td');
            const idx = tr.id.split('_')[1];
            // Ambil foto dari IndexedDB
            let likeFoto = null, comenFoto = null, shareFoto = null;
            try { likeFoto = await getFotoBase64('img_like_' + idx); } catch(e){}
            try { comenFoto = await getFotoBase64('img_comen_' + idx); } catch(e){}
            try { shareFoto = await getFotoBase64('img_share_' + idx); } catch(e){}
            tableBodyRows.push(new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph(tds[0]?.querySelector('input')?.value || '')] }),
                    new TableCell({ children: [new Paragraph(tds[1]?.querySelector('textarea')?.value || '')] }),
                    imgCell(likeFoto, 'Like', idx),
                    imgCell(comenFoto, 'Comen', idx),
                    imgCell(shareFoto, 'Share', idx),
                ]
            }));
        }

        docChildren.push(new Table({
            rows: [tableHeader, ...tableBodyRows]
        }));

        doc = new Document({
            sections: [
                {
                    properties: {
                        page: {
                            size: {
                                orientation: "landscape"
                            }
                        }
                    },
                    children: docChildren
                }
            ]
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Generate nama file
        let bulan = '';
        try {
            bulan = document.getElementById('periode_bulan')?.value || '';
        } catch(e) {}
        const now = new Date();
        const tanggal = now.toISOString().slice(0,10).replace(/-/g,'');
        const jam = String(now.getHours()).padStart(2,'0') + String(now.getMinutes()).padStart(2,'0') + String(now.getSeconds()).padStart(2,'0');
        a.download = `EVIDANCE_${bulan}_${tanggal}_${jam}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        alert('Gagal mengekspor ke Word. Pastikan data dan foto sudah benar.\nError: ' + err);
    }
}

window.exportLaporanToWord = exportLaporanToWord;
