// ============================================================
// CONFIGURAZIONE SUPABASE — PORTALE TORRE & PARTNERS
// ============================================================

const CONFIG = {
    SUPABASE_URL: 'https://xxlblqrzdvtfeiwaleko.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bGJscXJ6ZHZ0ZmVpd2FsZWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NzY1OTQsImV4cCI6MjA5ODU1MjU5NH0.ufiyw2Xh5FodGhlbalTaYAg8LUsx4olTpQnjA40nLbs',
    BUCKET_NAME: 'TorreAndPartners',
    SITO_NOME: 'Torre & Partners',
    AREA_TITOLO: 'Area Riservata Condomini'
};

// ============================================================
// FUNZIONI SUPABASE VIA FETCH (senza librerie esterne)
// ============================================================

async function supabaseQuery(tabella, options = {}) {
    let url = `${CONFIG.SUPABASE_URL}/rest/v1/${tabella}`;
    
    const params = new URLSearchParams();
    
    // Select columns
    if (options.select) {
        params.append('select', options.select);
    } else {
        params.append('select', '*');
    }
    
    // Filtri
    if (options.filtri) {
        for (const [col, val] of Object.entries(options.filtri)) {
            params.append(`${col}`, `eq.${val}`);
        }
    }
    
    // Order
    if (options.order) {
        params.append('order', options.order);
    }
    
    const queryString = params.toString();
    if (queryString) url += '?' + queryString;
    
    const headers = {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    
    // Se single, aggiungi header
    if (options.single) {
        headers['Accept'] = 'application/vnd.pgrst.object+json';
    }
    
    const response = await fetch(url, { headers, method: options.method || 'GET' });
    
    if (options.single) {
        if (!response.ok) return { data: null, error: response.statusText };
        return { data: await response.json(), error: null };
    }
    
    if (response.status === 204) return { data: null, error: null };
    
    const data = await response.json();
    if (!response.ok) return { data: null, error: data };
    
    return { data, error: null };
}

async function supabaseInsert(tabella, valori) {
    const response = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/${tabella}`, {
        method: 'POST',
        headers: {
            'apikey': CONFIG.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(valori)
    });
    
    if (!response.ok) {
        const err = await response.json();
        return { error: err };
    }
    return { error: null };
}

async function supabaseUpdate(tabella, valori, filtroCol, filtroVal) {
    const response = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/${tabella}?${filtroCol}=eq.${filtroVal}`, {
        method: 'PATCH',
        headers: {
            'apikey': CONFIG.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(valori)
    });
    
    if (!response.ok) {
        const err = await response.json();
        return { error: err };
    }
    return { error: null };
}

async function supabaseDelete(tabella, filtroCol, filtroVal) {
    const response = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/${tabella}?${filtroCol}=eq.${filtroVal}`, {
        method: 'DELETE',
        headers: {
            'apikey': CONFIG.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
            'Accept': 'application/json'
        }
    });
    
    if (!response.ok) return { error: response.statusText };
    return { error: null };
}

async function supabaseCount(tabella, filtroCol, filtroVal) {
    const response = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/${tabella}?${filtroCol}=eq.${filtroVal}&select=id`, {
        method: 'HEAD',
        headers: {
            'apikey': CONFIG.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
            'Accept': 'application/json',
            'Prefer': 'count=exact'
        }
    });
    
    return parseInt(response.headers.get('content-range')?.split('/')[1] || '0');
}

// Storage: upload file
async function supabaseUpload(bucket, path, file) {
    const url = `${CONFIG.SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'apikey': CONFIG.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
            'Content-Type': file.type
        },
        body: file
    });
    
    if (!response.ok) {
        const err = await response.json();
        return { error: err.message || 'Upload fallito' };
    }
    return { error: null };
}

// Storage: delete file
async function supabaseDeleteFile(bucket, path) {
    const url = `${CONFIG.SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'apikey': CONFIG.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
        }
    });
    return { error: response.ok ? null : 'Errore cancellazione' };
}

// Storage: public URL
function supabasePublicUrl(bucket, path) {
    return `${CONFIG.SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
