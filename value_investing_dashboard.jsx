const { useState, useMemo } = React;
const { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ComposedChart, Area 
} = Recharts;

// ============ REAL DATA FROM SEC FILINGS & COMPANY REPORTS ============

const COLORS = {
  bg: "#0a0e17", card: "#111827", cardHover: "#1a2332", border: "#1e293b",
  accent: "#3b82f6", accentLight: "#60a5fa", gold: "#f59e0b", green: "#10b981",
  red: "#ef4444", purple: "#8b5cf6", cyan: "#06b6d4", pink: "#ec4899",
  text: "#e2e8f0", textMuted: "#94a3b8", textDim: "#64748b",
};

const STOCK_COLORS = {
  "BRK.B": "#7c3aed", "JPM": "#2563eb", "JNJ": "#059669", "UNH": "#0891b2", "MU": "#d97706",
  "0700": "#16a34a", "9988": "#ea580c", "1398": "#dc2626", "2318": "#0d9488", "1299": "#7c3aed",
};

// Revenue history (in billions USD) - sourced from SEC filings / annual reports
const companies = {
  "BRK.B": {
    name: "Berkshire Hathaway", nameCn: "伯克希尔哈撒韦", exchange: "NYSE", sector: "Diversified",
    pe: 16, fwdPe: 20.6, pb: 1.6, roe: 9.8, roic: 17.1, debtEquity: 0.19, divYield: 0,
    marketCap: 1050, cashB: 374, revenueB: 371, netIncomeB: 67, fcfB: 25, beta: 0.69,
    employees: 396000, currentRatio: 7.07,
    revenueHistory: [
      { year: "2019", value: 254.6 }, { year: "2020", value: 245.5 }, { year: "2021", value: 276.1 },
      { year: "2022", value: 302.1 }, { year: "2023", value: 364.5 }, { year: "2024", value: 371.4 },
    ],
    operatingEarnings: [
      { year: "2019", value: 23.97 }, { year: "2020", value: 21.92 }, { year: "2021", value: 27.46 },
      { year: "2022", value: 30.79 }, { year: "2023", value: 37.35 }, { year: "2024", value: 47.44 },
    ],
    // Moat: Cash pile vs S&P 500 concentration
    cashHistory: [
      { year: "2019", cash: 128 }, { year: "2020", cash: 138 }, { year: "2021", cash: 147 },
      { year: "2022", cash: 128 }, { year: "2023", cash: 168 }, { year: "2024", cash: 334 }, { year: "2025 Q3", cash: 374 },
    ],
    segmentRevenue: [
      { name: "Insurance", value: 83.3, pct: 22 }, { name: "BNSF Railway", value: 23.4, pct: 6 },
      { name: "BH Energy", value: 24.6, pct: 7 }, { name: "Manufacturing", value: 75.5, pct: 20 },
      { name: "Service & Retail", value: 95.6, pct: 26 }, { name: "Investment Income", value: 69, pct: 19 },
    ],
    topHoldings: [
      { name: "Apple", value: 75.1 }, { name: "Bank of America", value: 33.2 },
      { name: "Coca-Cola", value: 25.5 }, { name: "Chevron", value: 18.6 },
      { name: "Occidental Petroleum", value: 14.2 }, { name: "Kraft Heinz", value: 10.5 },
    ],
  },
  "JPM": {
    name: "JPMorgan Chase", nameCn: "摩根大通", exchange: "NYSE", sector: "Banking",
    pe: 14.5, fwdPe: 13.8, pb: 2.2, roe: 17, roic: 3.2, debtEquity: 1.5, divYield: 2.1,
    marketCap: 700, cashB: 36, revenueB: 180, netIncomeB: 58, fcfB: 45, beta: 1.1,
    employees: 318512, currentRatio: 0.9,
    revenueHistory: [
      { year: "2019", value: 115.6 }, { year: "2020", value: 119.5 }, { year: "2021", value: 121.6 },
      { year: "2022", value: 128.7 }, { year: "2023", value: 158.1 }, { year: "2024", value: 180.6 },
    ],
    segmentRevenue: [
      { name: "Consumer & Comm Banking", value: 71.5, pct: 40 }, { name: "Corp & Investment Bank", value: 70.1, pct: 39 },
      { name: "Asset & Wealth Mgmt", value: 21.5, pct: 12 }, { name: "Commercial Banking", value: 17.5, pct: 10 },
    ],
    // Moat: Assets, deposits, branch network
    depositsHistory: [
      { year: "2019", value: 1562 }, { year: "2020", value: 2144 }, { year: "2021", value: 2462 },
      { year: "2022", value: 2340 }, { year: "2023", value: 2401 }, { year: "2024", value: 2406 },
    ],
    aum: [
      { year: "2019", value: 2424 }, { year: "2020", value: 2714 }, { year: "2021", value: 3119 },
      { year: "2022", value: 2776 }, { year: "2023", value: 3427 }, { year: "2024", value: 4009 },
    ],
    newCheckingAccounts: [
      { year: "2020", value: 1.2 }, { year: "2021", value: 1.5 }, { year: "2022", value: 1.8 },
      { year: "2023", value: 1.9 }, { year: "2024", value: 2.0 },
    ],
  },
  "JNJ": {
    name: "Johnson & Johnson", nameCn: "强生", exchange: "NYSE", sector: "Healthcare",
    pe: 22, fwdPe: 21, pb: 6.5, roe: 35, roic: 13.3, debtEquity: 0.6, divYield: 2.4,
    marketCap: 400, cashB: 20, revenueB: 94.2, netIncomeB: 26.8, fcfB: 18, beta: 0.35,
    employees: 94000, currentRatio: 1.03,
    revenueHistory: [
      { year: "2019", value: 82.1 }, { year: "2020", value: 82.6 }, { year: "2021", value: 93.8 },
      { year: "2022", value: 95.0 }, { year: "2023", value: 85.2 }, { year: "2024", value: 94.2 },
    ],
    segmentRevenue: [
      { name: "Innovative Medicine", value: 57.1, pct: 61 }, { name: "MedTech", value: 37.1, pct: 39 },
    ],
    pipelineDrugs: [
      { phase: "Phase I", count: 18 }, { phase: "Phase II", count: 27 },
      { phase: "Phase III", count: 14 }, { phase: "Filed/Approved", count: 8 },
    ],
    dividendHistory: [
      { year: "2019", value: 3.75 }, { year: "2020", value: 4.04 }, { year: "2021", value: 4.24 },
      { year: "2022", value: 4.52 }, { year: "2023", value: 4.76 }, { year: "2024", value: 4.96 },
    ],
  },
  "UNH": {
    name: "UnitedHealth Group", nameCn: "联合健康集团", exchange: "NYSE", sector: "Healthcare",
    pe: 18, fwdPe: 16.5, pb: 5.8, roe: 24, roic: 12, debtEquity: 0.7, divYield: 1.6,
    marketCap: 500, cashB: 28, revenueB: 400, netIncomeB: 23, fcfB: 24, beta: 0.7,
    employees: 440000, currentRatio: 0.8,
    revenueHistory: [
      { year: "2019", value: 242 }, { year: "2020", value: 257 }, { year: "2021", value: 287 },
      { year: "2022", value: 324 }, { year: "2023", value: 371 }, { year: "2024", value: 400 },
    ],
    segmentRevenue: [
      { name: "UnitedHealthcare", value: 281, pct: 70 }, { name: "Optum Health", value: 55, pct: 14 },
      { name: "Optum Rx", value: 44, pct: 11 }, { name: "Optum Insight", value: 20, pct: 5 },
    ],
    membersM: [
      { year: "2019", value: 49.5 }, { year: "2020", value: 48.8 }, { year: "2021", value: 49.7 },
      { year: "2022", value: 51.4 }, { year: "2023", value: 52.8 }, { year: "2024", value: 53.6 },
    ],
    optumCareProviders: [
      { year: "2020", value: 56000 }, { year: "2021", value: 60000 },
      { year: "2022", value: 70000 }, { year: "2023", value: 90000 }, { year: "2024", value: 100000 },
    ],
  },
  "MU": {
    name: "Micron Technology", nameCn: "美光科技", exchange: "NASDAQ", sector: "Semiconductors",
    pe: 25, fwdPe: 12, pb: 2.8, roe: 18, roic: 14, debtEquity: 0.3, divYield: 0.4,
    marketCap: 100, cashB: 8.7, revenueB: 29.1, netIncomeB: 5.7, fcfB: 3.2, beta: 1.2,
    employees: 48000, currentRatio: 2.7,
    revenueHistory: [
      { year: "FY20", value: 21.4 }, { year: "FY21", value: 27.7 }, { year: "FY22", value: 30.8 },
      { year: "FY23", value: 15.5 }, { year: "FY24", value: 25.1 }, { year: "FY25", value: 29.1 },
    ],
    segmentRevenue: [
      { name: "DRAM", value: 22, pct: 76 }, { name: "NAND", value: 7.1, pct: 24 },
    ],
    hbmRevenue: [
      { qtr: "Q1 FY24", value: 0.1 }, { qtr: "Q2 FY24", value: 0.3 }, { qtr: "Q3 FY24", value: 0.6 },
      { qtr: "Q4 FY24", value: 1.0 }, { qtr: "Q1 FY25", value: 1.4 }, { qtr: "Q2 FY25", value: 1.8 },
    ],
    grossMarginHistory: [
      { year: "FY20", value: 31 }, { year: "FY21", value: 37 }, { year: "FY22", value: 45 },
      { year: "FY23", value: -9 }, { year: "FY24", value: 22 }, { year: "FY25", value: 37 },
    ],
  },
  "0700": {
    name: "Tencent Holdings", nameCn: "腾讯控股", exchange: "HKEX", sector: "Technology",
    pe: 22, fwdPe: 19, pb: 5.0, roe: 22, roic: 18, debtEquity: 0.4, divYield: 1,
    marketCap: 530, cashB: 61, revenueB: 91.7, netIncomeB: 26, fcfB: 22, beta: 0.8,
    employees: 105417, currentRatio: 1.4,
    revenueHistory: [
      { year: "2019", value: 55.5 }, { year: "2020", value: 69.8 }, { year: "2021", value: 86.5 },
      { year: "2022", value: 80.5 }, { year: "2023", value: 83.9 }, { year: "2024", value: 91.7 },
    ],
    segmentRevenue: [
      { name: "Games (Domestic)", value: 19.6, pct: 21 }, { name: "Games (Int'l)", value: 8.1, pct: 9 },
      { name: "Social Networks", value: 17, pct: 19 }, { name: "Marketing Services", value: 17, pct: 19 },
      { name: "FinTech & Biz Services", value: 29.7, pct: 32 },
    ],
    wechatMAU: [
      { year: "2019", value: 1165 }, { year: "2020", value: 1225 }, { year: "2021", value: 1268 },
      { year: "2022", value: 1313 }, { year: "2023", value: 1343 }, { year: "2024", value: 1382 },
    ],
    buybackHKB: [
      { year: "2021", value: 2.8 }, { year: "2022", value: 33.8 }, { year: "2023", value: 49.4 },
      { year: "2024", value: 112 },
    ],
    miniProgramGMV: [
      { year: "2021", value: 750 }, { year: "2022", value: 1000 }, { year: "2023", value: 1600 },
      { year: "2024", value: 2000 },
    ],
  },
  "9988": {
    name: "Alibaba Group", nameCn: "阿里巴巴集团", exchange: "HKEX", sector: "Technology",
    pe: 23, fwdPe: 11, pb: 1.8, roe: 12, roic: 9, debtEquity: 0.2, divYield: 1,
    marketCap: 310, cashB: 62, revenueB: 137.3, netIncomeB: 16, fcfB: 21, beta: 0.9,
    employees: 195300, currentRatio: 1.5,
    revenueHistory: [
      { year: "FY20", value: 72 }, { year: "FY21", value: 109.5 }, { year: "FY22", value: 134.6 },
      { year: "FY23", value: 130.4 }, { year: "FY24", value: 130.3 }, { year: "FY25", value: 137.3 },
    ],
    segmentRevenue: [
      { name: "Taobao & Tmall", value: 61.8, pct: 45 }, { name: "Cloud Intelligence", value: 16.5, pct: 12 },
      { name: "Int'l Commerce (AIDC)", value: 16.3, pct: 12 }, { name: "Cainiao Logistics", value: 12.4, pct: 9 },
      { name: "Local Services", value: 9.1, pct: 7 }, { name: "Others", value: 21.2, pct: 15 },
    ],
    cloudRevenueQtr: [
      { qtr: "Q1 FY24", value: 3.5 }, { qtr: "Q2 FY24", value: 3.8 }, { qtr: "Q3 FY24", value: 3.7 },
      { qtr: "Q4 FY24", value: 3.5 }, { qtr: "Q1 FY25", value: 3.7 }, { qtr: "Q2 FY25", value: 4.2 },
      { qtr: "Q3 FY25", value: 5.6 }, { qtr: "Q1 FY26", value: 4.7 },
    ],
    buybackB: [
      { year: "FY22", value: 9.5 }, { year: "FY23", value: 18.1 }, { year: "FY24", value: 12.5 }, { year: "FY25", value: 12 },
    ],
  },
  "1398": {
    name: "ICBC", nameCn: "中国工商银行", exchange: "HKEX", sector: "Banking",
    pe: 6.5, fwdPe: 6, pb: 0.6, roe: 10, roic: 1.2, debtEquity: 8.5, divYield: 7.7,
    marketCap: 310, cashB: 520, revenueB: 112, netIncomeB: 48.6, fcfB: 35, beta: 0.5,
    employees: 415159, currentRatio: 1.0,
    revenueHistory: [
      { year: "2019", value: 113 }, { year: "2020", value: 116 }, { year: "2021", value: 117 },
      { year: "2022", value: 114 }, { year: "2023", value: 110 }, { year: "2024", value: 112 },
    ],
    totalAssetsT: [
      { year: "2019", value: 30.1 }, { year: "2020", value: 33.3 }, { year: "2021", value: 35.2 },
      { year: "2022", value: 39.2 }, { year: "2023", value: 44.1 }, { year: "2024", value: 46.7 },
    ],
    nplRatio: [
      { year: "2019", value: 1.43 }, { year: "2020", value: 1.58 }, { year: "2021", value: 1.42 },
      { year: "2022", value: 1.38 }, { year: "2023", value: 1.36 }, { year: "2024", value: 1.30 },
    ],
    dividendPerShare: [
      { year: "2019", value: 0.26 }, { year: "2020", value: 0.27 }, { year: "2021", value: 0.29 },
      { year: "2022", value: 0.31 }, { year: "2023", value: 0.32 }, { year: "2024", value: 0.34 },
    ],
  },
  "2318": {
    name: "Ping An Insurance", nameCn: "中国平安", exchange: "HKEX", sector: "Insurance",
    pe: 8.5, fwdPe: 7.5, pb: 0.9, roe: 15, roic: 3, debtEquity: 6.0, divYield: 5.5,
    marketCap: 125, cashB: 80, revenueB: 170, netIncomeB: 18, fcfB: 15, beta: 0.7,
    employees: 340000, currentRatio: 1.1,
    revenueHistory: [
      { year: "2019", value: 168 }, { year: "2020", value: 168 }, { year: "2021", value: 167 },
      { year: "2022", value: 156 }, { year: "2023", value: 149 }, { year: "2024", value: 170 },
    ],
    segmentRevenue: [
      { name: "Life & Health Ins", value: 68, pct: 40 }, { name: "P&C Insurance", value: 44, pct: 26 },
      { name: "Banking (Ping An Bank)", value: 34, pct: 20 }, { name: "FinTech & HealthTech", value: 24, pct: 14 },
    ],
    techPatents: [
      { year: "2019", value: 21000 }, { year: "2020", value: 31000 }, { year: "2021", value: 38000 },
      { year: "2022", value: 44000 }, { year: "2023", value: 49000 }, { year: "2024", value: 52000 },
    ],
    retailCustomersM: [
      { year: "2019", value: 200 }, { year: "2020", value: 218 }, { year: "2021", value: 227 },
      { year: "2022", value: 227 }, { year: "2023", value: 231 }, { year: "2024", value: 234 },
    ],
  },
  "1299": {
    name: "AIA Group", nameCn: "友邦保险", exchange: "HKEX", sector: "Insurance",
    pe: 15, fwdPe: 13, pb: 2.1, roe: 14, roic: 8, debtEquity: 0.3, divYield: 2,
    marketCap: 105, cashB: 12, revenueB: 20, netIncomeB: 7, fcfB: 6, beta: 0.9,
    employees: 23000, currentRatio: 1.2,
    revenueHistory: [
      { year: "2019", value: 14.8 }, { year: "2020", value: 14.1 }, { year: "2021", value: 17.3 },
      { year: "2022", value: 16.0 }, { year: "2023", value: 17.9 }, { year: "2024", value: 20.0 },
    ],
    vonb: [
      { year: "2019", value: 3.96 }, { year: "2020", value: 2.79 }, { year: "2021", value: 3.26 },
      { year: "2022", value: 3.16 }, { year: "2023", value: 4.04 }, { year: "2024", value: 4.74 },
    ],
    marketMix: [
      { name: "China (HK/ML)", value: 35 }, { name: "Thailand", value: 15 },
      { name: "Singapore", value: 13 }, { name: "Malaysia", value: 8 },
      { name: "Other Asia", value: 29 },
    ],
  },
};

const tickers = Object.keys(companies);

const comparisonMetrics = [
  { key: "pe", label: "P/E Ratio 市盈率", fmt: v => v.toFixed(1) + "x" },
  { key: "roe", label: "ROE 净资产收益率", fmt: v => v.toFixed(1) + "%" },
  { key: "divYield", label: "Dividend Yield 股息率", fmt: v => v.toFixed(1) + "%" },
  { key: "debtEquity", label: "Debt/Equity 负债比", fmt: v => v.toFixed(2) },
  { key: "marketCap", label: "Market Cap ($B) 市值", fmt: v => "$" + v + "B" },
  { key: "beta", label: "Beta 贝塔系数", fmt: v => v.toFixed(2) },
];

function MetricCard({ label, value, sub }) {
  return (
    <div style={{ background: COLORS.card, borderRadius: 10, padding: "14px 18px", border: `1px solid ${COLORS.border}`, minWidth: 120 }}>
      <div style={{ fontSize: 11, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function ChartCard({ title, titleCn, children, height = 300 }) {
  return (
    <div style={{ background: COLORS.card, borderRadius: 12, padding: 20, border: `1px solid ${COLORS.border}`, marginBottom: 16 }}>
      <div style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>{title}</span>
        {titleCn && <span style={{ fontSize: 13, color: COLORS.textDim, marginLeft: 8 }}>{titleCn}</span>}
      </div>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

function CompanyFinancials({ ticker }) {
  const c = companies[ticker];
  const color = STOCK_COLORS[ticker] || COLORS.accent;
  const PIES = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];
  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <MetricCard label="P/E" value={`${c.pe}x`} sub={`Fwd: ${c.fwdPe}x`} />
        <MetricCard label="ROE" value={`${c.roe}%`} />
        <MetricCard label="Div Yield" value={`${c.divYield}%`} />
        <MetricCard label="D/E" value={c.debtEquity.toFixed(2)} />
        <MetricCard label="Mkt Cap" value={`$${c.marketCap}B`} />
        <MetricCard label="Revenue" value={`$${c.revenueB}B`} />
        <MetricCard label="Net Income" value={`$${c.netIncomeB}B`} />
        <MetricCard label="Cash" value={`$${c.cashB}B`} />
        <MetricCard label="Beta" value={c.beta.toFixed(2)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ChartCard title="Revenue History ($B)" titleCn="营收历史">
          <ResponsiveContainer>
            <BarChart data={c.revenueHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="year" tick={{ fill: COLORS.textMuted, fontSize: 11 }} />
              <YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} />
              <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} />
              <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} name="Revenue ($B)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Revenue Breakdown" titleCn="营收结构">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={c.segmentRevenue} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" label={({ name, pct }) => `${name} ${pct}%`} labelLine={{ stroke: COLORS.textDim }}>
                {c.segmentRevenue.map((_, i) => <Cell key={i} fill={PIES[i % PIES.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function CompanyMoat({ ticker }) {
  const c = companies[ticker];
  const color = STOCK_COLORS[ticker] || COLORS.accent;
  const PIES = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];
  const moatCharts = {
    "BRK.B": () => (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ChartCard title="Cash & T-Bill Reserves ($B)" titleCn="现金与国债储备" height={280}>
          <ResponsiveContainer><ComposedChart data={c.cashHistory}><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis dataKey="year" tick={{ fill: COLORS.textMuted, fontSize: 10 }} /><YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Area dataKey="cash" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={2} name="Cash ($B)" /></ComposedChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Top Equity Holdings ($B)" titleCn="主要持股" height={280}>
          <ResponsiveContainer><BarChart data={c.topHoldings} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis type="number" tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><YAxis type="category" dataKey="name" tick={{ fill: COLORS.textMuted, fontSize: 11 }} width={110} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Bar dataKey="value" fill={COLORS.gold} radius={[0, 4, 4, 0]} name="Value ($B)" /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Operating Earnings ($B)" titleCn="经营利润" height={280}>
          <ResponsiveContainer><LineChart data={c.operatingEarnings}><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis dataKey="year" tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Line dataKey="value" stroke={COLORS.green} strokeWidth={2.5} dot={{ fill: COLORS.green, r: 4 }} name="Op Earnings ($B)" /></LineChart></ResponsiveContainer>
        </ChartCard>
      </div>
    ),
    "JPM": () => (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ChartCard title="Customer Deposits ($B)" titleCn="客户存款" height={280}>
          <ResponsiveContainer><BarChart data={c.depositsHistory}><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis dataKey="year" tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} name="Deposits ($B)" /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Total Assets Under Management ($B)" titleCn="资产管理规模" height={280}>
          <ResponsiveContainer><LineChart data={c.aum}><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis dataKey="year" tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Line dataKey="value" stroke={COLORS.gold} strokeWidth={2.5} dot={{ fill: COLORS.gold, r: 4 }} name="AUM ($B)" /></LineChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Net New Checking Accounts (M/yr)" titleCn="新增活期账户(百万)" height={280}>
          <ResponsiveContainer><BarChart data={c.newCheckingAccounts}><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis dataKey="year" tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Bar dataKey="value" fill={COLORS.green} radius={[4, 4, 0, 0]} name="New Accounts (M)" /></BarChart></ResponsiveContainer>
        </ChartCard>
      </div>
    ),
    "JNJ": () => (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ChartCard title="Drug Pipeline by Phase" titleCn="药物管线阶段" height={280}>
          <ResponsiveContainer><BarChart data={c.pipelineDrugs}><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis dataKey="phase" tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Bar dataKey="count" fill={COLORS.green} radius={[4, 4, 0, 0]} name="Drugs" /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Dividend Per Share ($)" titleCn="每股股息" height={280}>
          <ResponsiveContainer><LineChart data={c.dividendHistory}><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis dataKey="year" tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} domain={[3, 5.5]} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Line dataKey="value" stroke={COLORS.gold} strokeWidth={2.5} dot={{ fill: COLORS.gold, r: 4 }} name="DPS ($)" /></LineChart></ResponsiveContainer>
        </ChartCard>
      </div>
    ),
    "UNH": () => (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ChartCard title="Insurance Members (Millions)" titleCn="保险会员(百万)" height={280}>
          <ResponsiveContainer><LineChart data={c.membersM}><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis dataKey="year" tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} domain={[45, 56]} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Line dataKey="value" stroke={COLORS.cyan} strokeWidth={2.5} dot={{ fill: COLORS.cyan, r: 4 }} name="Members (M)" /></LineChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Optum Care Providers" titleCn="Optum医护人员" height={280}>
          <ResponsiveContainer><BarChart data={c.optumCareProviders}><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis dataKey="year" tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Bar dataKey="value" fill={COLORS.green} radius={[4, 4, 0, 0]} name="Providers" /></BarChart></ResponsiveContainer>
        </ChartCard>
      </div>
    ),
    "MU": () => (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ChartCard title="HBM Revenue Ramp ($B est.)" titleCn="HBM收入增长" height={280}>
          <ResponsiveContainer><BarChart data={c.hbmRevenue}><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis dataKey="qtr" tick={{ fill: COLORS.textMuted, fontSize: 9 }} /><YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Bar dataKey="value" fill={COLORS.gold} radius={[4, 4, 0, 0]} name="HBM Rev ($B)" /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Gross Margin (%)" titleCn="毛利率" height={280}>
          <ResponsiveContainer><LineChart data={c.grossMarginHistory}><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis dataKey="year" tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Line dataKey="value" stroke={COLORS.accent} strokeWidth={2.5} dot={{ fill: COLORS.accent, r: 4 }} name="Gross Margin (%)" /></LineChart></ResponsiveContainer>
        </ChartCard>
      </div>
    ),
    "0700": () => (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ChartCard title="WeChat/Weixin MAU (Millions)" titleCn="微信月活用户(百万)" height={280}>
          <ResponsiveContainer><LineChart data={c.wechatMAU}><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis dataKey="year" tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} domain={[1100, 1420]} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Line dataKey="value" stroke={COLORS.green} strokeWidth={2.5} dot={{ fill: COLORS.green, r: 4 }} name="MAU (M)" /></LineChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Mini Program GMV (B CNY)" titleCn="小程序交易额(亿元)" height={280}>
          <ResponsiveContainer><BarChart data={c.miniProgramGMV}><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis dataKey="year" tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Bar dataKey="value" fill={COLORS.accent} radius={[4, 4, 0, 0]} name="GMV (B CNY)" /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Share Buybacks (HK$ B)" titleCn="股份回购(港币十亿)" height={280}>
          <ResponsiveContainer><BarChart data={c.buybackHKB}><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis dataKey="year" tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Bar dataKey="value" fill={COLORS.purple} radius={[4, 4, 0, 0]} name="Buyback (HK$B)" /></BarChart></ResponsiveContainer>
        </ChartCard>
      </div>
    ),
    "9988": () => (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ChartCard title="Cloud Intelligence Revenue ($B/Qtr)" titleCn="云智能季度收入" height={280}>
          <ResponsiveContainer><BarChart data={c.cloudRevenueQtr}><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis dataKey="qtr" tick={{ fill: COLORS.textMuted, fontSize: 9 }} /><YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Bar dataKey="value" fill={COLORS.accent} radius={[4, 4, 0, 0]} name="Cloud Rev ($B)" /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Share Buybacks ($B/FY)" titleCn="股份回购" height={280}>
          <ResponsiveContainer><BarChart data={c.buybackB}><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis dataKey="year" tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Bar dataKey="value" fill={COLORS.gold} radius={[4, 4, 0, 0]} name="Buyback ($B)" /></BarChart></ResponsiveContainer>
        </ChartCard>
      </div>
    ),
    "1398": () => (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ChartCard title="Total Assets (CNY Trillion)" titleCn="总资产(万亿元)" height={280}>
          <ResponsiveContainer><BarChart data={c.totalAssetsT}><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis dataKey="year" tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Bar dataKey="value" fill={COLORS.red} radius={[4, 4, 0, 0]} name="Assets (T CNY)" /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Non-Performing Loan Ratio (%)" titleCn="不良贷款率" height={280}>
          <ResponsiveContainer><LineChart data={c.nplRatio}><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis dataKey="year" tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} domain={[1.2, 1.7]} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Line dataKey="value" stroke={COLORS.green} strokeWidth={2.5} dot={{ fill: COLORS.green, r: 4 }} name="NPL Ratio (%)" /></LineChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Dividend Per Share (CNY)" titleCn="每股股息(元)" height={280}>
          <ResponsiveContainer><LineChart data={c.dividendPerShare}><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis dataKey="year" tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} domain={[0.2, 0.4]} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Line dataKey="value" stroke={COLORS.gold} strokeWidth={2.5} dot={{ fill: COLORS.gold, r: 4 }} name="DPS (CNY)" /></LineChart></ResponsiveContainer>
        </ChartCard>
      </div>
    ),
    "2318": () => (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ChartCard title="Technology Patents (Cumulative)" titleCn="科技专利(累计)" height={280}>
          <ResponsiveContainer><BarChart data={c.techPatents}><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis dataKey="year" tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Bar dataKey="value" fill={COLORS.cyan} radius={[4, 4, 0, 0]} name="Patents" /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Retail Customers (Millions)" titleCn="个人客户(百万)" height={280}>
          <ResponsiveContainer><LineChart data={c.retailCustomersM}><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis dataKey="year" tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} domain={[190, 240]} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Line dataKey="value" stroke={COLORS.green} strokeWidth={2.5} dot={{ fill: COLORS.green, r: 4 }} name="Customers (M)" /></LineChart></ResponsiveContainer>
        </ChartCard>
      </div>
    ),
    "1299": () => (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ChartCard title="Value of New Business ($B)" titleCn="新业务价值" height={280}>
          <ResponsiveContainer><LineChart data={c.vonb}><CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} /><XAxis dataKey="year" tick={{ fill: COLORS.textMuted, fontSize: 11 }} /><YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} domain={[2, 5.5]} /><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /><Line dataKey="value" stroke={COLORS.purple} strokeWidth={2.5} dot={{ fill: COLORS.purple, r: 4 }} name="VONB ($B)" /></LineChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Revenue by Market (%)" titleCn="各市场占比" height={280}>
          <ResponsiveContainer><PieChart><Pie data={c.marketMix} cx="50%" cy="50%" outerRadius={95} innerRadius={45} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={{ stroke: COLORS.textDim }}>{c.marketMix.map((_, i) => <Cell key={i} fill={PIES[i % PIES.length]} />)}</Pie><Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} /></PieChart></ResponsiveContainer>
        </ChartCard>
      </div>
    ),
  };
  return moatCharts[ticker] ? moatCharts[ticker]() : null;
}

function CompareView() {
  const [metric, setMetric] = useState("pe");
  const m = comparisonMetrics.find(x => x.key === metric);
  const data = tickers.map(t => ({ name: companies[t].name.split(" ")[0], ticker: t, value: companies[t][metric] })).sort((a, b) => b.value - a.value);
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {comparisonMetrics.map(cm => (
          <button key={cm.key} onClick={() => setMetric(cm.key)} style={{
            padding: "8px 16px", borderRadius: 8, border: `1px solid ${metric === cm.key ? COLORS.accent : COLORS.border}`,
            background: metric === cm.key ? COLORS.accent + "22" : "transparent", color: metric === cm.key ? COLORS.accent : COLORS.textMuted,
            cursor: "pointer", fontSize: 12, fontWeight: 600,
          }}>{cm.label}</button>
        ))}
      </div>
      <ChartCard title={m.label} height={420}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis type="number" tick={{ fill: COLORS.textMuted, fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: COLORS.textMuted, fontSize: 11 }} width={100} />
            <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} formatter={v => m.fmt(v)} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} name={m.label}>
              {data.map((d, i) => <Cell key={i} fill={STOCK_COLORS[d.ticker] || COLORS.accent} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function App() {
  const [tab, setTab] = useState("overview");
  const [selectedTicker, setSelectedTicker] = useState("BRK.B");
  const [subTab, setSubTab] = useState("financials");
  const c = companies[selectedTicker];

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "Inter, sans-serif", color: COLORS.text }}>
      <div style={{ borderBottom: `1px solid ${COLORS.border}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>
            <span style={{ color: COLORS.accent }}>◆</span> Value Investor's Compass
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["overview", "company", "compare"].map(k => (
            <button key={k} onClick={() => setTab(k)} style={{
              padding: "8px 18px", borderRadius: 8, border: `1px solid ${tab === k ? COLORS.accent : COLORS.border}`,
              background: tab === k ? COLORS.accent : "transparent", color: tab === k ? "#fff" : COLORS.textMuted,
              cursor: "pointer", fontSize: 13, fontWeight: 600,
            }}>{k.charAt(0).toUpperCase() + k.slice(1)}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: "20px 24px", maxWidth: 1280, margin: "0 auto" }}>
        {tab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 20 }}>
              {tickers.map(t => (
                <div key={t} onClick={() => { setSelectedTicker(t); setTab("company"); }} style={{ background: COLORS.card, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.border}`, cursor: "pointer" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: STOCK_COLORS[t] }}>{t}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>{companies[t].name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "company" && (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
              {tickers.map(t => (
                <button key={t} onClick={() => setSelectedTicker(t)} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${selectedTicker === t ? STOCK_COLORS[t] : COLORS.border}`, background: selectedTicker === t ? STOCK_COLORS[t] + "22" : "transparent" }}>{t}</button>
              ))}
            </div>
            <CompanyFinancials ticker={selectedTicker} />
          </div>
        )}
        {tab === "compare" && <CompareView />}
      </div>
    </div>
  );
}

// Expose a global function so app.js can trigger rendering
// when the valueView becomes visible (display:block)
window.renderValueDashboard = function() {
  const container = document.getElementById('valueView');
  if (!container) return;
  // Only render once
  if (container._reactRoot) return;
  const root = ReactDOM.createRoot(container);
  container._reactRoot = root;
  root.render(<App />);
};
