// script.js
// expects input.json in same folder (array of objects)
// ordering of columns required:
// INDEX, FULL_NAME (FIRST_NAME + LAST_NAME), COMPLETENESS_SCORE, RELEVANCE_SCORE, RELEVANCE_DESCRIPTION, COMPANY_NAME, COMPANY_INDUSTRY, COMPANY_DOMAIN , COMPANY_REVENUE, COMPANY_CITY, COMPANY_STATE, VALID_PHONES, COMPANY_SIC, LINKEDIN_URL, SIC_DESCRIPTION (from COMPANY_SIC_DETAIL)
// plus rest after that (we'll add JOB_TITLE, COMPANY_DESCRIPTION, BUSINESS_EMAILS)

const HEAD_ORDER = [
    { key: 'VIEW', label: '' },       // first column: View button
    { key: 'CREATE', label: '' },     // second column: Create (calls createNetSuiteProscpect)
    { key: 'INDEX', label: 'Index' },
    { key: 'FULL_NAME', label: 'Full name' },
    { key: 'COMPLETENESS_SCORE', label: 'Completeness' },
    { key: 'RELEVANCE_SCORE', label: 'Relevance' },
    { key: 'RELEVANCE_DESCRIPTION', label: 'Relevance description' },
    { key: 'COMPANY_NAME', label: 'Company' },
    { key: 'COMPANY_INDUSTRY', label: 'Industry' },
    { key: 'COMPANY_DOMAIN', label: 'Domain' },
    { key: 'COMPANY_REVENUE', label: 'Revenue' },
    { key: 'COMPANY_CITY', label: 'City' },
    { key: 'COMPANY_STATE', label: 'State' },
    { key: 'VALID_PHONES', label: 'Valid phones' },
    { key: 'COMPANY_SIC', label: 'Company SIC' },
    { key: 'LINKEDIN_URL', label: 'LinkedIn' },
    { key: 'SIC_DESCRIPTION', label: 'SIC description' },
    // rest of columns (reasonable selection)
    { key: 'JOB_TITLE', label: 'Job title' },
    { key: 'COMPANY_DESCRIPTION', label: 'Company description' },
    { key: 'BUSINESS_EMAIL', label: 'Business emails' },
  ];
  
  let data = [];
  let filtered = [];
  let currentSort = { key: null, dir: 1 };
  
  const tableHead = document.getElementById('tableHead');
  const tableBody = document.getElementById('tableBody');
  const searchInput = document.getElementById('searchInput');
  const sortBtns = document.querySelectorAll('.sort-btn');
  
  function createHead() {
    tableHead.innerHTML = '';
    HEAD_ORDER.forEach(col => {
      const th = document.createElement('th');
      th.className = `col-${col.key.toLowerCase()}`;
      const label = document.createElement('span');
      label.className = 'head-label';
      label.textContent = col.label;
      th.appendChild(label);
      // allow clicking header to sort only for specified fields (see requirement)
      if (['RELEVANCE_SCORE','COMPLETENESS_SCORE','COMPANY_NAME'].includes(col.key)) {
        th.style.cursor = 'pointer';
        th.title = 'Click to sort';
        th.addEventListener('click', () => toggleSort(col.key));
      }
      tableHead.appendChild(th);
    });
  }
  
  function renderTable(rows) {
    tableBody.innerHTML = '';
    rows.forEach((r, idx) => {
      const tr = document.createElement('tr');
  
      // VIEW button column
      const tdView = document.createElement('td');
      tdView.className = 'col-actions';
      const vb = document.createElement('button');
      vb.className = 'btn ghost';
      vb.innerHTML = 'View';
      vb.addEventListener('click', () => openDetail(r));
      tdView.appendChild(vb);
      tr.appendChild(tdView);
  
      // CREATE column (calls createNetSuiteProscpect)
      const tdCreate = document.createElement('td');
      tdCreate.className = 'col-actions';
      const cb = document.createElement('button');
      cb.className = 'btn primary';
      cb.textContent = 'Create';
      cb.addEventListener('click', () => createNetSuiteProscpect(r));
      tdCreate.appendChild(cb);
      tr.appendChild(tdCreate);
  
      // INDEX
      const tdIndex = document.createElement('td');
      tdIndex.className = 'col-index';
      tdIndex.innerHTML = `<span class="cell-content">${r.INDEX ?? idx}</span>`;
      tr.appendChild(tdIndex);
  
      // FULL_NAME
      const fullName = [r.FIRST_NAME, r.LAST_NAME].filter(Boolean).join(' ').trim() || '';
      tr.appendChild(makeCell('FULL_NAME', fullName, fullName));
  
      // COMPLETENESS_SCORE
      tr.appendChild(makeCell('COMPLETENESS_SCORE', r.COMPLETENESS_SCORE, String(r.COMPLETENESS_SCORE)));
  
      // RELEVANCE_SCORE
      tr.appendChild(makeCell('RELEVANCE_SCORE', r.RELEVANCE_SCORE, String(r.RELEVANCE_SCORE)));
  
      // RELEVANCE_DESCRIPTION
      tr.appendChild(makeCell('RELEVANCE_DESCRIPTION', r.RELEVANCE_DESCRIPTION));
  
      // COMPANY_NAME
      tr.appendChild(makeCell('COMPANY_NAME', r.COMPANY_NAME));
  
      // COMPANY_INDUSTRY
      tr.appendChild(makeCell('COMPANY_INDUSTRY', r.COMPANY_INDUSTRY));
  
      // COMPANY_DOMAIN
      tr.appendChild(makeCell('COMPANY_DOMAIN', r.COMPANY_DOMAIN));
  
      // COMPANY_REVENUE
      tr.appendChild(makeCell('COMPANY_REVENUE', r.COMPANY_REVENUE));
  
      // COMPANY_CITY
      tr.appendChild(makeCell('COMPANY_CITY', r.COMPANY_CITY));
  
      // COMPANY_STATE
      tr.appendChild(makeCell('COMPANY_STATE', r.COMPANY_STATE));
  
      // VALID_PHONES (array)
      const phones = Array.isArray(r.VALID_PHONES) ? r.VALID_PHONES.join(', ') : (r.VALID_PHONES || '');
      tr.appendChild(makeCell('VALID_PHONES', phones, phones));
  
      // COMPANY_SIC (array)
      const sic = Array.isArray(r.COMPANY_SIC) ? r.COMPANY_SIC.join(', ') : (r.COMPANY_SIC || '');
      tr.appendChild(makeCell('COMPANY_SIC', sic, sic));
  
      // LINKEDIN_URL
      const linkedin = r.LINKEDIN_URL || r.COMPANY_LINKEDIN_URL || '';
      tr.appendChild(makeCell('LINKEDIN_URL', linkedin, linkedin));
  
      // SIC_DESCRIPTION (derived from COMPANY_SIC_DETAIL array)
      let sicDesc = '';
      if (Array.isArray(r.COMPANY_SIC_DETAIL)) {
        sicDesc = r.COMPANY_SIC_DETAIL.map(d => d.INDUSTRY_TITLE || '').filter(Boolean).join('; ');
      }
      tr.appendChild(makeCell('SIC_DESCRIPTION', sicDesc));
  
      // JOB_TITLE
      tr.appendChild(makeCell('JOB_TITLE', r.JOB_TITLE));
  
      // COMPANY_DESCRIPTION
      tr.appendChild(makeCell('COMPANY_DESCRIPTION', r.COMPANY_DESCRIPTION));
  
      // BUSINESS_EMAIL (BUSINESS_EMAIL array)
      const bemails = Array.isArray(r.BUSINESS_EMAIL) ? r.BUSINESS_EMAIL.join(', ') : (r.BUSINESS_EMAIL || r.DEEP_VERIFIED_EMAILS || '');
      tr.appendChild(makeCell('BUSINESS_EMAIL', bemails, bemails));
  
      tableBody.appendChild(tr);
    });
  }
  
  function makeCell(key, val = '', fullText = null) {
    const td = document.createElement('td');
    const span = document.createElement('span');
    span.className = 'cell-content';
    span.textContent = (val === null || typeof val === 'undefined') ? '' : val;
    if (!fullText) fullText = span.textContent;
    if (fullText && fullText.length > 60) {
      span.title = fullText;
    } else if (fullText) {
      span.title = fullText;
    }
    td.appendChild(span);
    return td;
  }
  
  function openDetail(record) {
    // open detail page in new tab with uuid or index
    const uuid = record.UUID ? encodeURIComponent(record.UUID) : '';
    const idx = record.INDEX ?? '';
    if (uuid) {
      window.open(`detail.html?uuid=${uuid}`, '_blank');
    } else {
      window.open(`detail.html?index=${idx}`, '_blank');
    }
  }
  
//   function createNetSuiteProscpect(record) {
//     // IMPORTANT: user requested this exact function name and that it currently be empty
//     console.log('clicked', record?.UUID ?? record?.INDEX ?? null);
//     createProspect(record)
    
//     // keep empty for user to implement later
//   }

async function createNetSuiteProscpect(record) {
    console.log('clicked', record?.UUID ?? record?.INDEX ?? null);
  
    // 🔧 Change this to your deployed or local API base URL
    const api_url = "https://optimed-api.vercel.app/api/create-prospect";
    // const api_url = "http://localhost:3000/api/create-prospect/";
    // Example for local testing:
    // const api_url = "http://localhost:3000/api/create-prospect";
  
    try {
      const response = await fetch(api_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(record),
      });
  
      const data = await response.json();
  
      if (response.ok && data.status === "success") {
        alert("✅ Record created successfully in NetSuite!");
      } else {
        alert("⚠️ Failed to create record: " + (data.message || "Unknown error"));
        console.error("API Error:", data);
      }
    } catch (error) {
      console.error("❌ Network or server error:", error);
      alert("❌ Unable to reach the API. Please try again later.");
    }
  }
  
  
  // sorting
  function toggleSort(key) {
    if (!key) return;
    if (currentSort.key === key) currentSort.dir *= -1;
    else {
      currentSort.key = key;
      currentSort.dir = 1;
    }
    applySort();
    highlightSortButton(key);
  }
  
  function numericValueFor(r, key) {
    const v = r[key];
    if (typeof v === 'number') return v;
    if (v == null || v === '') return -Infinity;
    const parsed = Number(String(v).replace(/[^0-9.\-]+/g,'')); // strip non-numeric
    return Number.isFinite(parsed) ? parsed : String(v).toLowerCase();
  }
  
  function applySort() {
    if (!currentSort.key) {
      renderTable(filtered);
      return;
    }
    const key = currentSort.key;
    const dir = currentSort.dir;
    const sorted = [...filtered].sort((a,b) => {
      // special-case: COMPANY_NAME string
      if (key === 'COMPANY_NAME') {
        const A = (a.COMPANY_NAME || '').toLowerCase();
        const B = (b.COMPANY_NAME || '').toLowerCase();
        return A.localeCompare(B) * dir;
      }
      const va = numericValueFor(a, key);
      const vb = numericValueFor(b, key);
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      // fallback to string compare
      return String(va).localeCompare(String(vb)) * dir;
    });
    renderTable(sorted);
  }
  
  // search
  let searchTimeout = null;
  searchInput.addEventListener('input', () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(applyFilter, 220);
  });
  
  function applyFilter() {
    const q = (searchInput.value || '').trim().toLowerCase();
    if (!q) {
      filtered = [...data];
      applySort();
      return;
    }
    filtered = data.filter(r => {
      const fullName = [r.FIRST_NAME, r.LAST_NAME].filter(Boolean).join(' ').toLowerCase();
      const company = (r.COMPANY_NAME || '').toLowerCase();
      return fullName.includes(q) || company.includes(q);
    });
    applySort();
  }
  
  function highlightSortButton(key) {
    sortBtns.forEach(b => {
      if (b.dataset.key === key) b.classList.add('active');
      else b.classList.remove('active');
    });
  }
  
  // hook up top sort buttons
  sortBtns.forEach(b => {
    b.addEventListener('click', () => {
      const k = b.dataset.key;
      toggleSort(k);
    });
  });
  
  // initial load
  createHead();
  
  fetch('input.json')
    .then(r => r.json())
    .then(arr => {
      // keep original array reference
      data = Array.isArray(arr) ? arr : [];
      // ensure indexes exist if not present
      data.forEach((d, i) => {
        if (typeof d.INDEX === 'undefined' || d.INDEX === null) d.INDEX = i;
        // compute FULL_NAME helpers if needed
        d._FULL_NAME = [d.FIRST_NAME, d.LAST_NAME].filter(Boolean).join(' ').trim();
      });
      filtered = [...data];
      renderTable(filtered);
    })
    .catch(err => {
      console.error('Failed to load input.json', err);
      tableBody.innerHTML = `<tr><td colspan="${HEAD_ORDER.length}">Failed to load input.json — check file placement and console.</td></tr>`;
    });
  
  // expose createNetSuiteProscpect globally just in case
  window.createNetSuiteProscpect = createNetSuiteProscpect;
  