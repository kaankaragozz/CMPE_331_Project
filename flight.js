// 1. Uçuş verilerini bir dizi (array) içinde tanımlayalım
const ucuslar = [
    { no: "TK1985", kalkis: "İstanbul", varis: "Londra", saat: "14:30", durum: "Zamanında" },
    { no: "LH202",  kalkis: "Münih",    varis: "Berlin", saat: "16:15", durum: "Gecikmeli" },
    { no: "UA55",   kalkis: "New York", varis: "Chicago",saat: "09:00", durum: "İptal" }
];

// 2. Verileri tek tek yazdırmak için döngü kuralım
console.log("--- Uçuş Listesi ---");

ucuslar.forEach((ucus) => {
    console.log(`Uçuş ${ucus.no}: ${ucus.kalkis} -> ${ucus.varis} (${ucus.saat}) - Durum: ${ucus.durum}`);
});

// İPUCU: Veriyi tablo olarak görmek için bu sihirli kodu kullan:
console.table(ucuslar);