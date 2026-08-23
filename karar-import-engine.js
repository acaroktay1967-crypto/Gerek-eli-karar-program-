(function () {
    const SECTIONS = {
        iddianame: 'I. İddianame Özeti',
        savunma: 'II. Sanık Savunması',
        tanik: 'III. Tanık Beyanları',
        rapor: 'IV. Adli Raporların Değerlendirilmesi',
        hukuki: 'V. Hukuki Gerekçe',
        hukum: 'VI. Hüküm'
    };

    const RULES = [
        {
            section: 'iddianame',
            strong: ['iddianame', 'iddianame özeti', 'kamu davası açılmıştır', 'cezalandırılması talep'],
            medium: ['iddia', 'sevk maddesi', 'esas hakkında mütalaa', 'mütalaa', 'suç tarihi', 'mağdur'],
            weak: ['sanık hakkında', 'olay tarihinde', 'yüklenen suç']
        },
        {
            section: 'savunma',
            strong: ['sanık savunması', 'müdafi savunması', 'suçlamayı kabul etmedi', 'beraatini talep'],
            medium: ['savunma', 'müdafi', 'vekil', 'inkar etti', 'kabul etmedi', 'pişman olduğunu'],
            weak: ['beyanında', 'sorgusunda', 'diye savunmuştur']
        },
        {
            section: 'tanik',
            strong: ['tanık beyanı', 'müşteki beyanı', 'mağdur beyanı', 'katılan beyanı'],
            medium: ['tanık', 'müşteki', 'mağdur', 'katılan', 'ifadesinde', 'anlatımında'],
            weak: ['beyan etti', 'gördüğünü', 'duyduğunu']
        },
        {
            section: 'rapor',
            strong: ['adli tıp raporu', 'bilirkişi raporu', 'kriminal rapor', 'adli rapor'],
            medium: ['rapor', 'adli tıp', 'atk', 'bilirkişi', 'kriminal', 'hts', 'baz', 'uzman raporu'],
            weak: ['muayene', 'tespit', 'kanaat bildirilmiştir', 'inceleme']
        },
        {
            section: 'hukuki',
            strong: ['hukuki gerekçe', 'delillerin değerlendirilmesi', 'hukuki değerlendirme'],
            medium: ['gerekçe', 'tck', 'cmk', 'yargıtay', 'anayasa mahkemesi', 'aihm', 'kanun maddesi'],
            weak: ['oluş ve dosya kapsamı', 'mahkememizce', 'değerlendirildiğinde']
        },
        {
            section: 'hukum',
            strong: ['hüküm', 'karar verildi', 'aşağıdaki şekilde hüküm kurulmuştur'],
            medium: ['cezalandırılmasına', 'beraatine', 'mahkumiyetine', 'hapis cezası', 'adli para cezası'],
            weak: ['tutukluluk halinin', 'yargılama gideri', 'kanun yolu']
        }
    ];

    const EXTENSION_WEIGHTS = [
        { pattern: /iddianame|mütalaa|mutalaa|iddia/i, section: 'iddianame', score: 8 },
        { pattern: /savunma|müdafi|mudafi|sanik/i, section: 'savunma', score: 8 },
        { pattern: /tanık|tanik|müşteki|musteki|mağdur|magdur|katılan|katilan/i, section: 'tanik', score: 8 },
        { pattern: /rapor|adli|bilirkişi|bilirkisi|kriminal|hts|baz/i, section: 'rapor', score: 8 },
        { pattern: /gerekçe|gerekce|hukuk|yargıtay|yargitay|tck|cmk/i, section: 'hukuki', score: 8 },
        { pattern: /hüküm|hukum|karar|sonuç|sonuc/i, section: 'hukum', score: 8 }
    ];

    function normalize(value) {
        return String(value || '')
            .toLocaleLowerCase('tr-TR')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function countMatches(text, keywords, weight) {
        return keywords.reduce((total, keyword) => {
            return text.includes(normalize(keyword)) ? total + weight : total;
        }, 0);
    }

    function classify(name, content) {
        const normalizedName = normalize(name);
        const normalizedContent = normalize(content);
        const combined = `${normalizedName} ${normalizedContent}`;
        const scores = {};

        Object.keys(SECTIONS).forEach(section => {
            scores[section] = 0;
        });

        EXTENSION_WEIGHTS.forEach(rule => {
            if (rule.pattern.test(name || '')) scores[rule.section] += rule.score;
        });

        RULES.forEach(rule => {
            scores[rule.section] += countMatches(combined, rule.strong, 6);
            scores[rule.section] += countMatches(combined, rule.medium, 3);
            scores[rule.section] += countMatches(combined, rule.weak, 1);
        });

        const ranked = Object.entries(scores)
            .sort((a, b) => b[1] - a[1])
            .map(([section, score]) => ({ section, score }));

        const best = ranked[0] || { section: 'hukuki', score: 0 };
        return {
            section: best.score > 0 ? best.section : 'hukuki',
            score: best.score,
            confidence: best.score >= 12 ? 'yüksek' : best.score >= 6 ? 'orta' : 'düşük',
            alternatives: ranked.slice(1, 4)
        };
    }

    function isSupported(name) {
        return /\.(txt|html?|udf|pdf|docx?|odt)$/i.test(name || '');
    }

    function makeSnippet(content, limit = 260) {
        const text = String(content || '').replace(/\s+/g, ' ').trim();
        if (!text) return 'İçerik okunamadı; dosya adına göre sınıflandırıldı.';
        return text.length > limit ? `${text.slice(0, limit)}...` : text;
    }

    window.KararImportEngine = {
        sections: SECTIONS,
        classify,
        isSupported,
        makeSnippet
    };
})();
