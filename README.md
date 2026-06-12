# FIFA 2026 World Cup - Live Tracker & Predictions 🏆

Geleceğin futbol heyecanını bugünden yaşamak ve 2026 FIFA Dünya Kupası'nı (Kuzey Amerika) benzersiz bir arayüzle anbean takip etmek için geliştirilmiş ultra-modern, gerçek zamanlı web uygulaması.

Tamamen **Next.js**, **React**, **Tailwind CSS** ve **Lucide Icons** kullanılarak inşa edilmiş; **API-Football** ve **Football-Data.org** ile entegre "Hybrid Cache" sistemine sahip premium bir platformdur.

---

## 🌟 Öne Çıkan Özellikler

### 1. 📊 Genel Bakış ve Canlı Skorlar
- Turnuvanın tüm maçlarını (Grup aşamasından finale kadar) tek ekranda, kronolojik olarak ve **CANLI** skor animasyonlarıyla takip etme.
- Gelişmiş Filtreleme: İster takım adına göre arayın, ister "Bugünün Maçları", "Canlı", "Tamamlandı" veya "Yaklaşanlar" sekmelerine tıklayarak takvimi yönetin.
- **Gol Uyarı Sistemi (Goal Alerts):** Canlı oynanan bir maçta gol olduğunda sitenin neresinde olursanız olun sağ üstte düşen şık bildirimler!

### 2. 🔍 Gelişmiş Maç Detayları (Modal)
Herhangi bir maça tıklayıp **"Maçı İncele"** dediğinizde sizi adeta bir "Sofascore" ekranı karşılıyor:
- **İlk 11'ler (Lineups):** Takımların dizilişleri interaktif bir futbol sahası üzerinde 2D olarak haritalanır. Yedekler tek tıkla listelenir.
- **Detay (Canlı Anlatım):** Gol, Sarı/Kırmızı Kart, Oyuncu Değişiklikleri ve VAR uyarıları kendi zaman çizelgesinde (timeline) dakikası dakikasına gösterilir.
- **İstatistikler:** Topla Oynama, Şutlar, Pas İsabeti, Kornerler vb. maç içi tüm istatistik bar grafikleri.
- **Premium Analiz (H2H):** İki takımın daha önce oynadığı son 5 karşılaşmanın listesi ve yüzdelik oranlarla galibiyet (Kazanma Olasılığı) şansı.

### 3. 🏟️ Gruplar ve Puan Durumu
- Şık cam (glassmorphism) tasarımlı kartlarla A'dan L'ye kadar tam 12 grubun güncel canlı puan tabloları.
- Galibiyet, beraberlik, mağlubiyet, atılan/yenilen gol ve averaj bilgilerinin gerçek zamanlı hesaplanması.
- Tur atlama senaryolarına uygun renk kodlamaları (1. ve 2.'ler yeşil vb.)

### 4. 📈 Turnuva İstatistikleri
- Turnuva boyunca "Gol Krallığı", "Asist Krallığı" gibi popüler listeler.
- Takım bazlı detaylar: **En Çok Gol Atan Takımlar**, **En Az Gol Yiyen Takımlar (Kaleler)**. (Ayrıca "Kalesini Gole Kapatanlar" vb. gibi ince detaylar).

### 5. ❤️ Favori Takım Modülü
- Tuttuğunuz takımı seçerek sitenin tüm akışını kişiselleştirin.
- **Favoriler Sekmesi:** Takımınızın bayrağı ve geniş bir afişi. Takımınızın yaklaşan maçları ve güncel kadrosunun (mevki, piyasa değeri vb.) tek bir şık listesi.

### 6. 🔮 Tahmin ve Sosyal Etkileşim
- **İlk 11 Kurma (Dream Team):** Sağdaki geniş saha arayüzünden turnuva boyunca kendi favori 11'inizi seçip, takımınızı oluşturabilirsiniz. 
- **Skor Tahminleri:** Hangi maç kaç kaç biter? Şampiyon kim olur? Sürpriz takım hangisi? Tüm bunları tahmin panosuna yazıp anında gönderebilirsiniz.

---

## 🛠 Teknik Altyapı ve Veri Çekme Stratejisi (Hybrid Cache)

Bu proje API sınırlarını korumak ve olası sunucu çökmelerini (Timeout) önlemek adına özel bir **"Hibrit"** mimari ile kodlanmıştır:

- **API-Football (Sınırlı) ve Football-Data (Sınırsız) Harmanı:** Projenin bel kemiğini oluşturur. Uygulama, günde 100 limit veren API-Football ile limitsiz Football-Data.org API'sini `api-merger` sayesinde akıllıca birleştirir.
- **Kalıcı Ön Bellek (H2H Cache):** İki takımın daha önceki maç geçmişi (H2H) maç başı sadece **1 kere** API'den çekilir ve sisteme kaydedilir. Limitsiz analiz imkanı sağlar.
- **Statik Yedekleme:** Fikstür ve gruplar `wc2026-config.ts` ile statik olarak güvenceye alınır. Eğer API patlarsa bile site mükemmel şekilde çalışmaya ve grupları göstermeye devam eder. Sadece skorlar "0-0" veya "Başlamadı" görünür, kullanıcı hatasız bir şekilde dolaşır.

---

## 🚀 Kurulum (Local Development)

Projeyi kendi bilgisayarınızda çalıştırmak için:

1. Repoyu klonlayın:
```bash
git clone <repository-url>
cd 2026-World-Cup
```

2. Paketleri yükleyin:
```bash
npm install
```

3. Gerekli Ortam Değişkenlerini (Environment Variables) tanımlayın. Kök dizine `.env.local` dosyası oluşturun:
```env
NEXT_PUBLIC_FOOTBALL_DATA_TOKEN=your_football_data_token_here
NEXT_PUBLIC_API_FOOTBALL_KEY=your_api_football_key_here
```

4. Geliştirme sunucusunu çalıştırın:
```bash
npm run dev
```

Tarayıcınızdan `http://localhost:3000` adresine giderek siteyi görüntüleyebilirsiniz.

---

## 📱 Vercel ile Canlıya Alma (Deployment)

Projenizi tüm dünyada ve mobilde kullanılabilir hale getirmek için **Vercel** platformunu öneriyoruz:

1. [Vercel](https://vercel.com/) üzerinde bir hesap açın.
2. Sağ üstten **"Add New Project"** butonuna tıklayıp GitHub hesabınızı bağlayın.
3. Bu repoyu (`2026-World-Cup`) seçip **Import** deyin.
4. "Environment Variables" sekmesine gelin ve `NEXT_PUBLIC_FOOTBALL_DATA_TOKEN` ve `NEXT_PUBLIC_API_FOOTBALL_KEY` şifrelerinizi aynen ekleyin.
5. **Deploy** butonuna basın. 2 dakika içerisinde uygulamanız canlı yayında olacak!

---

*Geleceğin futbol şöleni için hazırlandı. Dünya Kupası ruhuyla geliştirildi.* 🌍⚽
