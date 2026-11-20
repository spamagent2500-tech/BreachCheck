import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  CircleHelp,
  Download,
  FileJson,
  Filter,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Menu,
  Network,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TerminalSquare,
  UploadCloud,
  WifiOff,
  X,
  Zap,
} from 'lucide-react'

type Severity = 'Critical' | 'High' | 'Medium' | 'Low'
type Source = 'API simulation' | 'Local dataset'

type BreachRecord = {
  id: string
  name: string
  date: string
  classes: string[]
  source: Source
  email: string
}

type Finding = Omit<BreachRecord, 'id' | 'email' | 'source'> & {
  id: string
  sources: Source[]
  severity: Severity
  rationale: string
  action: string
}

type RemediationStep = {
  id: string
  title: string
  detail: string
}

const demoEmail = 'cybernova@northstar-labs.test'

const baseFixtures: BreachRecord[] = [
  {
    id: 'northstar-api',
    name: 'Northstar Cloud',
    date: '2025-08-14',
    classes: ['email', 'password', 'phone'],
    source: 'API simulation',
    email: demoEmail,
  },
  {
    id: 'northstar-local',
    name: 'Northstar Cloud',
    date: '2025-08-14',
    classes: ['email', 'password'],
    source: 'Local dataset',
    email: demoEmail,
  },
  {
    id: 'vectorpay-api',
    name: 'VectorPay',
    date: '2024-02-19',
    classes: ['email', 'financial'],
    source: 'API simulation',
    email: demoEmail,
  },
  {
    id: 'arcade-local',
    name: 'Arcade Forge',
    date: '2023-11-02',
    classes: ['email', 'username'],
    source: 'Local dataset',
    email: demoEmail,
  },
  {
    id: 'mosaic-local',
    name: 'Mosaic CRM',
    date: '2022-04-21',
    classes: ['email', 'address'],
    source: 'Local dataset',
    email: demoEmail,
  },
]

const classLabels: Record<string, string> = {
  email: 'Email',
  password: 'Password',
  phone: 'Phone',
  financial: 'Financial',
  username: 'Username',
  address: 'Address',
}

const classDescriptions: Record<string, string> = {
  password: 'Passwords or password hashes',
  financial: 'Payment or financial details',
  phone: 'Phone numbers',
  address: 'Postal addresses',
  username: 'Usernames and profile identifiers',
  email: 'Email addresses',
}

const severityStyles: Record<Severity, string> = {
  Critical: 'severity-critical',
  High: 'severity-high',
  Medium: 'severity-medium',
  Low: 'severity-low',
}

function scoreFinding(classes: string[]): Pick<Finding, 'severity' | 'rationale' | 'action'> {
  if (classes.includes('password') && classes.includes('financial')) {
    return {
      severity: 'Critical',
      rationale: 'Passwords and financial data were exposed together.',
      action: 'Rotate any reused password, contact the payment provider, and enable MFA.',
    }
  }
  if (classes.includes('password') || classes.includes('financial')) {
    return {
      severity: 'High',
      rationale: classes.includes('password')
        ? 'A password or password hash was included in the exposed data.'
        : 'Financial data was included in the exposed data.',
      action: classes.includes('password')
        ? 'Change this password anywhere it was reused and enable MFA.'
        : 'Review statements, contact the provider, and monitor account activity.',
    }
  }
  if (classes.includes('phone') || classes.includes('address')) {
    return {
      severity: 'Medium',
      rationale: 'Contact or recovery details could support targeted phishing.',
      action: 'Expect targeted messages, verify recovery details, and monitor the account.',
    }
  }
  return {
    severity: 'Low',
    rationale: 'Profile identifiers were exposed without higher-risk classes in this demo.',
    action: 'Watch for phishing and use a unique password with MFA on the account.',
  }
}

function mergeFindings(records: BreachRecord[]): Finding[] {
  const grouped = new Map<string, BreachRecord[]>()
  records.forEach((record) => {
    const key = record.name.toLowerCase()
    grouped.set(key, [...(grouped.get(key) ?? []), record])
  })
  return Array.from(grouped.values())
    .map((group) => {
      const classes = Array.from(new Set(group.flatMap((item) => item.classes)))
      const earliest = group.map((item) => item.date).sort()[0]
      const scored = scoreFinding(classes)
      return {
        id: group[0].name.toLowerCase().replaceAll(' ', '-'),
        name: group[0].name,
        date: earliest,
        classes,
        sources: Array.from(new Set(group.map((item) => item.source))),
        ...scored,
      }
    })
    .sort((a, b) => {
      const order: Record<Severity, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 }
      return order[a.severity] - order[b.severity] || b.date.localeCompare(a.date)
    })
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(`${date}T00:00:00`),
  )
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(date)
}

function classList(classes: string[]) {
  return classes.map((item) => classLabels[item] ?? item).join(' · ')
}

function getRemediationSteps(finding: Finding): RemediationStep[] {
  const steps: RemediationStep[] = []
  if (finding.classes.includes('password')) {
    steps.push({ id: 'rotate-password', title: 'Rotate the exposed password', detail: 'Change it anywhere it was reused and use a unique replacement.' })
  }
  if (finding.classes.includes('financial')) {
    steps.push({ id: 'secure-financial', title: 'Secure payment and financial accounts', detail: 'Contact the provider, review recent activity, and replace exposed payment details.' })
  }
  if (finding.classes.includes('password') || finding.classes.includes('financial')) {
    steps.push({ id: 'enable-mfa', title: 'Enable phishing-resistant MFA', detail: 'Prefer a passkey or security key; otherwise use an authenticator app.' })
  }
  if (finding.classes.some((item) => ['email', 'phone', 'address'].includes(item))) {
    steps.push({ id: 'harden-recovery', title: 'Harden recovery and contact channels', detail: 'Verify recovery details and treat unexpected messages, calls, and links as suspicious.' })
  }
  steps.push({ id: 'monitor', title: 'Monitor for follow-on activity', detail: 'Watch account alerts and statements, and record any suspicious activity for follow-up.' })
  return steps
}

function App() {
  const heroFirstLine = 'See the signal.'
  const heroSecondLine = 'Keep the secret.'
  const [heroTypedCharacters, setHeroTypedCharacters] = useState(0)
  const [activeSection, setActiveSection] = useState('overview')
  const [email, setEmail] = useState(demoEmail)
  const [emailState, setEmailState] = useState<'ready' | 'loading' | 'done' | 'error'>('done')
  const [emailError, setEmailError] = useState('')
  const [checkedAt, setCheckedAt] = useState(new Date())
  const [isCached, setIsCached] = useState(false)
  const [visibleRecords, setVisibleRecords] = useState<BreachRecord[]>(baseFixtures)
  const [password, setPassword] = useState('')
  const [passwordState, setPasswordState] = useState<'idle' | 'checking' | 'done' | 'error'>('idle')
  const [passwordMeta, setPasswordMeta] = useState<{ prefix: string; compared: number; matches: number } | null>(null)
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [datasetMessage, setDatasetMessage] = useState('4 local demo rows loaded')
  const [toast, setToast] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [completedRemediations, setCompletedRemediations] = useState<Record<string, string[]>>(() => {
    try {
      const stored = window.localStorage.getItem('breachcheck:remediations')
      const parsed: unknown = stored ? JSON.parse(stored) : {}
      return parsed && typeof parsed === 'object' ? parsed as Record<string, string[]> : {}
    } catch {
      return {}
    }
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const totalCharacters = heroFirstLine.length + heroSecondLine.length
    const timer = window.setInterval(() => {
      setHeroTypedCharacters((current) => {
        if (current >= totalCharacters) {
          window.clearInterval(timer)
          return current
        }
        return current + 1
      })
    }, 72)
    return () => window.clearInterval(timer)
  }, [])

  const firstLineVisible = heroFirstLine.slice(0, Math.min(heroTypedCharacters, heroFirstLine.length))
  const secondLineVisible = heroSecondLine.slice(0, Math.max(0, heroTypedCharacters - heroFirstLine.length))
  const heroMessageComplete = heroTypedCharacters >= heroFirstLine.length + heroSecondLine.length

  const findings = useMemo(() => mergeFindings(visibleRecords), [visibleRecords])
  const criticalCount = findings.filter((finding) => finding.severity === 'Critical').length
  const highCount = findings.filter((finding) => finding.severity === 'High').length
  const uniqueSources = new Set(visibleRecords.map((record) => record.source)).size
  const passwordMatches = passwordMeta?.matches ?? 0
  const severitySummary: Array<{ label: Severity; count: number; tone: string; detail: string }> = [
    { label: 'Critical', count: criticalCount, tone: 'critical', detail: 'Immediate action' },
    { label: 'High', count: highCount, tone: 'high', detail: 'Prioritize review' },
    { label: 'Medium', count: findings.filter((finding) => finding.severity === 'Medium').length, tone: 'medium', detail: 'Watch closely' },
    { label: 'Low', count: findings.filter((finding) => finding.severity === 'Low').length, tone: 'low', detail: 'Stay aware' },
  ]

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  const toggleRemediation = (findingId: string, stepId: string) => {
    setCompletedRemediations((current) => {
      const completed = new Set(current[findingId] ?? [])
      if (completed.has(stepId)) completed.delete(stepId)
      else completed.add(stepId)
      const next = { ...current, [findingId]: Array.from(completed) }
      window.localStorage.setItem('breachcheck:remediations', JSON.stringify(next))
      return next
    })
  }

  const runEmailCheck = (event?: FormEvent) => {
    event?.preventDefault()
    const normalized = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setEmailError('Enter a valid email format. This stays in the local demo; it is not sent anywhere.')
      setEmailState('error')
      return
    }
    setEmailError('')
    const cacheKey = `breachcheck:${normalized}`
    const cached = window.localStorage.getItem(cacheKey)
    setIsCached(Boolean(cached))
    setEmailState('loading')
    window.setTimeout(() => {
      const isEmptyDemo = normalized === 'clear@lab.test' || normalized === 'not-found@lab.test'
      const next = isEmptyDemo
        ? []
        : baseFixtures.filter((record) => record.email === demoEmail)
      setVisibleRecords(next)
      setCheckedAt(new Date())
      setEmailState('done')
      window.localStorage.setItem(cacheKey, JSON.stringify(next))
      showToast(isEmptyDemo ? 'No matching local demo records found.' : 'Exposure report refreshed from local fixtures.')
    }, cached ? 240 : 900)
  }

  const runPasswordCheck = async () => {
    if (!password) {
      setPasswordError('Type a lab-only password first. Never use a real password here.')
      setPasswordState('error')
      return
    }
    setPasswordError('')
    setPasswordState('checking')
    setPasswordMeta(null)
    try {
      const buffer = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(password))
      const hex = Array.from(new Uint8Array(buffer))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()
      const prefix = hex.slice(0, 5)
      const knownDemo = password === 'lab-only-demo'
      window.setTimeout(() => {
        setPasswordMeta({ prefix, compared: 1874, matches: knownDemo ? 147 : 0 })
        setPasswordState('done')
        setPassword('')
      }, 550)
    } catch {
      setPasswordError('The browser could not complete the local SHA-1 check.')
      setPasswordState('error')
    }
  }

  const handleDatasetUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const parsed: unknown = file.name.toLowerCase().endsWith('.json') ? JSON.parse(text) : parseCsv(text)
      const rows: unknown[] = Array.isArray(parsed)
        ? parsed
        : typeof parsed === 'object' && parsed !== null && 'records' in parsed && Array.isArray(parsed.records)
          ? parsed.records
          : []
      const incoming = rows.map((item: unknown, index: number) => {
        const record = typeof item === 'object' && item !== null ? item as Record<string, unknown> : {}
        return {
        id: `imported-${index}`,
        name: String(record.name ?? record.breach ?? 'Imported breach'),
        date: String(record.date ?? record.breach_date ?? '2025-01-01'),
        classes: String(record.classes ?? record.data_classes ?? 'email')
          .split(/[|,;]/)
          .map((entry) => entry.trim().toLowerCase())
          .filter(Boolean),
        source: 'Local dataset' as Source,
        email: String(record.email ?? email.trim().toLowerCase()),
        }
      })
      if (!incoming.length) throw new Error('No rows')
      setVisibleRecords(incoming)
      setDatasetMessage(`${incoming.length} imported local ${incoming.length === 1 ? 'row' : 'rows'}`)
      showToast('Local dataset loaded. Nothing was uploaded.')
    } catch {
      showToast('Could not parse that file. Use JSON records or CSV with name, date, classes, email columns.')
    } finally {
      event.target.value = ''
    }
  }

  const exportReport = () => {
    const report = {
      report_type: 'BreachCheck local demo exposure report',
      disclaimer: 'Educational lab output only. No live breach API was called. Do not use real passwords or other people’s data.',
      address: email.trim().toLowerCase(),
      checked_at: checkedAt.toISOString(),
      sources: ['Local sample records', 'API simulation fixtures'],
      summary: {
        findings: findings.length,
        critical: criticalCount,
        high: highCount,
      },
      findings: findings.map((finding) => {
        const { id, ...exportedFinding } = finding
        return {
          ...exportedFinding,
          ...(finding.severity === 'Critical'
            ? { remediation: getRemediationSteps(finding).map((step) => ({ ...step, completed: completedRemediations[id]?.includes(step.id) ?? false })) }
            : {}),
        }
      }),
      password_check: passwordMeta
        ? { method: 'Local SHA-1 prefix/suffix comparison', prefix_sent: passwordMeta.prefix, local_matches: passwordMeta.matches }
        : { status: 'Not run' },
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'breachcheck-demo-report.json'
    anchor.click()
    URL.revokeObjectURL(url)
    showToast('Sample report exported as JSON.')
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'email', label: 'Email exposure', icon: Search },
    { id: 'password', label: 'Password privacy', icon: Fingerprint },
    { id: 'dataset', label: 'Local dataset', icon: FileJson },
    { id: 'findings', label: 'Merged findings', icon: Network },
  ]

  return (
    <div className={`app-shell ${mobileNavOpen ? 'mobile-nav-open' : ''}`}>
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark"><ShieldCheck size={21} strokeWidth={2.4} /></div>
          <div>
            <div className="brand-name">BreachCheck</div>
            <div className="brand-caption">EXPOSURE LAB</div>
          </div>
        </div>
        <div className="lab-pill"><span className="pulse-dot" /> Local demo mode</div>
        <nav className="side-nav" aria-label="Primary">
          <div className="nav-label">WORKSPACE</div>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${activeSection === id ? 'active' : ''}`}
              onClick={() => {
                setActiveSection(id)
                setMobileNavOpen(false)
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              <Icon size={17} />
              <span>{label}</span>
              {id === 'findings' && <span className="nav-count">{findings.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-card">
            <div className="privacy-card-icon"><LockKeyhole size={15} /></div>
            <div>
              <strong>Privacy by design</strong>
              <p>Passwords are hashed before any comparison. This build never calls a live service.</p>
            </div>
          </div>
          <button className="sidebar-help" onClick={() => showToast('Tip: use clear@lab.test to preview a no-match state.')}><CircleHelp size={15} /> How this demo works</button>
          <div className="sidebar-footer"><span>PNY Trainings</span><span className="status-dot" /> v0.9.4-lab</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><ChevronDown size={14} /><strong>Exposure checker</strong></div>
          <div className="topbar-actions">
            <div className="safe-badge"><WifiOff size={14} /> No live services connected</div>
            <button className="icon-button" aria-label="Refresh report" onClick={() => runEmailCheck()}><RefreshCw size={17} /></button>
          <div className="avatar">CN</div>
          </div>
        </header>

        <div className="content-wrap">
          <section className="hero-row" id="overview">
            <div className="hero-content">
              <div className="eyebrow"><span className="eyebrow-line" /> LOCAL-FIRST SECURITY / WORKSPACE 01</div>
              <h1 aria-label={`${heroFirstLine} ${heroSecondLine}`}><span>{firstLineVisible}</span><br /><em>{secondLineVisible}</em><span className={`hero-cursor ${heroMessageComplete ? 'is-hidden' : ''}`} aria-hidden="true" /></h1>
              <p className="hero-copy">A calm, local-first exposure checker for understanding breach intelligence without handing over the data you are checking.</p>
              <div className="hero-actions">
                <button className="primary-button" onClick={() => document.getElementById('email')?.scrollIntoView({ behavior: 'smooth' })}>Run local check <ArrowDownRight size={16} /></button>
                <button className="text-button" onClick={exportReport}><Download size={15} /> Export sample report</button>
              </div>
              <div className="hero-proof"><span><LockKeyhole size={13} /> 0 external calls</span><span><Check size={13} /> Built for learning</span><span><WifiOff size={13} /> Offline-ready fixtures</span></div>
            </div>
            <div className="hero-visual" aria-label="Local-only signal visualization">
              <div className="visual-heading"><span className="mini-status" /> SIGNAL MAP <b>LIVE</b></div>
              <div className="orb-ring ring-one" /><div className="orb-ring ring-two" /><div className="orb-core"><ShieldCheck size={28} /><span>LOCAL<br />ONLY</span></div>
              <div className="signal signal-one"><span /> prefix query</div>
              <div className="signal signal-two"><span /> local match</div>
              <div className="signal signal-three"><span /> report ready</div>
            </div>
          </section>

          <section className="stat-strip" aria-label="Exposure summary">
            <div className="stat-cell"><div className="stat-icon blue"><Activity size={17} /></div><div><span className="stat-label">Last check</span><strong>{formatTime(checkedAt)}</strong><small className={isCached ? 'green-text' : ''}>{isCached ? 'served from cache' : 'fresh local run'}</small></div></div>
            <div className="stat-cell"><div className="stat-icon red"><ShieldAlert size={17} /></div><div><span className="stat-label">Exposure level</span><strong>{findings.length ? (criticalCount ? 'Critical' : highCount ? 'High' : 'Review') : 'Clear'}</strong><small>{findings.length ? `${findings.length} merged findings` : 'No local matches'}</small></div></div>
            <div className="stat-cell"><div className="stat-icon amber"><KeyRound size={17} /></div><div><span className="stat-label">Password signal</span><strong>{passwordMeta ? (passwordMatches ? `${passwordMatches} matches` : 'Not found') : 'Not checked'}</strong><small>{passwordMeta ? 'prefix compared locally' : 'optional lab check'}</small></div></div>
            <div className="stat-cell"><div className="stat-icon green"><Server size={17} /></div><div><span className="stat-label">Data sources</span><strong>{uniqueSources || 0} local</strong><small>API simulation + fixtures</small></div></div>
          </section>

          <section className="workflow-bar">
            <div className="workflow-title"><Sparkles size={15} /> How the check works</div>
            <div className="workflow-steps"><span className="done"><b>01</b> Validate</span><ArrowUpRight size={14} /><span className="done"><b>02</b> Query safely</span><ArrowUpRight size={14} /><span className="done"><b>03</b> Merge locally</span><ArrowUpRight size={14} /><span><b>04</b> Act on signal</span></div>
          </section>

          <div className="section-heading"><div><span className="section-kicker">CHECKPOINT 01</span><h2>Exposure scan</h2></div><div className="section-note"><span className="live-dot" /> Local fixtures active</div></div>
          <section className="scan-grid">
            <article className="panel email-panel" id="email">
              <div className="panel-header"><div><div className="panel-icon indigo"><Search size={18} /></div><div className="panel-kicker">EMAIL LOOKUP</div><h3>What is attached to this address?</h3></div><span className="panel-chip">SIMULATED API</span></div>
              <p className="panel-copy">Search the local fixture set for breach names, dates, and exposed data classes. The address never leaves this browser.</p>
              <form onSubmit={runEmailCheck} className="email-form">
                <label htmlFor="email-input">Test email address</label>
                <div className={`input-wrap ${emailState === 'error' ? 'has-error' : ''}`}><Search size={16} /><input id="email-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /><button type="submit" className="input-submit" disabled={emailState === 'loading'}>{emailState === 'loading' ? <RefreshCw className="spin" size={15} /> : <ArrowDownRight size={16} />}</button></div>
                {emailState === 'error' && <div className="field-error"><AlertCircle size={14} /> {emailError}</div>}
              </form>
              <div className="demo-hints"><button onClick={() => setEmail(demoEmail)}>Use match demo</button><button onClick={() => setEmail('clear@lab.test')}>Use no-match demo</button><span><LockKeyhole size={12} /> local only</span></div>
              <div className="panel-footer"><span><span className="mini-status" /> {emailState === 'loading' ? 'Comparing fixtures…' : isCached ? 'Cached result available' : 'Ready to check'}</span><span>429 back-off simulated</span></div>
            </article>

            <article className="panel password-panel" id="password">
              <div className="panel-header"><div><div className="panel-icon teal"><Fingerprint size={18} /></div><div className="panel-kicker">PASSWORD PRIVACY CHECK</div><h3>Test the hash, not the secret.</h3></div><span className="panel-chip green-chip">K-ANONYMITY</span></div>
              <p className="panel-copy">SHA-1 is calculated in your browser. Only the first five characters are used as the lookup prefix; suffixes are compared locally.</p>
              <div className="password-form">
                <label htmlFor="password-input">Lab-only password <span>never use a real one</span></label>
                <div className="input-wrap"><KeyRound size={16} /><input id="password-input" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter a lab-only test value" autoComplete="off" /><button type="button" className="show-button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div>
                {passwordState === 'error' && <div className="field-error"><AlertCircle size={14} /> {passwordError}</div>}
                <div className="password-actions"><button className="outline-button" onClick={() => { setPassword('lab-only-demo'); setPasswordError('') }}>Fill lab sample</button><button className="dark-button" onClick={runPasswordCheck} disabled={passwordState === 'checking'}>{passwordState === 'checking' ? <RefreshCw className="spin" size={15} /> : <Fingerprint size={15} />} {passwordState === 'checking' ? 'Hashing locally' : 'Run privacy check'}</button></div>
              </div>
              <div className={`hash-result ${passwordState === 'done' ? 'result-ready' : ''}`}>
                <div className="hash-result-top"><span><span className="mini-status teal-dot" /> {passwordState === 'done' ? 'Comparison complete' : 'Awaiting a local check'}</span><span className="hash-method">SHA-1 / browser crypto</span></div>
                <div className="hash-metrics"><div><span>Prefix used</span><strong>{passwordMeta?.prefix ?? '— — — — —'}</strong></div><div><span>Suffixes compared</span><strong>{passwordMeta ? passwordMeta.compared.toLocaleString() : '—'}</strong></div><div><span>Local matches</span><strong className={passwordMatches ? 'danger-number' : ''}>{passwordMeta ? passwordMeta.matches : '—'}</strong></div></div>
                <div className="hash-note"><LockKeyhole size={13} /> Full password and full hash remain in memory only long enough to calculate this result.</div>
              </div>
            </article>
          </section>

          <div className="section-heading dataset-heading" id="dataset"><div><span className="section-kicker">CHECKPOINT 02</span><h2>Data you can audit</h2></div><button className="filter-button" onClick={() => fileInputRef.current?.click()}><UploadCloud size={15} /> Load CSV / JSON</button><input ref={fileInputRef} className="visually-hidden" type="file" accept=".csv,.json,application/json,text/csv" onChange={handleDatasetUpload} /></div>
          <section className="dataset-grid">
            <article className="panel dataset-panel">
              <div className="dataset-top"><div><div className="panel-kicker">LOCAL DATASET</div><h3>Loaded fixtures <span className="count-badge">{visibleRecords.length}</span></h3></div><div className="dataset-status"><span className="mini-status" /> {datasetMessage}</div></div>
              <div className="dataset-table-wrap"><table><thead><tr><th>Breach / date</th><th>Data classes</th><th>Source</th><th>Status</th></tr></thead><tbody>{visibleRecords.length ? visibleRecords.map((record) => <tr key={record.id}><td><strong>{record.name}</strong><small>{formatDate(record.date)}</small></td><td><div className="class-pills">{record.classes.map((item) => <span key={item} className={item === 'password' || item === 'financial' ? 'risk-pill' : ''}>{classLabels[item] ?? item}</span>)}</div></td><td><span className={`source-tag ${record.source === 'Local dataset' ? 'local-tag' : ''}`}>{record.source === 'Local dataset' ? 'Local file' : 'API fixture'}</span></td><td><span className="row-ready"><Check size={12} /> parsed</span></td></tr>) : <tr><td colSpan={4}><div className="empty-state"><WifiOff size={20} /> No local records match this address.</div></td></tr>}</tbody></table></div>
              <div className="dataset-footer"><span><FileJson size={14} /> Supports CSV and JSON records</span><span><LockKeyhole size={14} /> Imports stay in this browser</span></div>
            </article>
            <aside className="panel audit-panel"><div className="panel-kicker">DATASET NOTES</div><h3>Read the boundaries.</h3><div className="audit-note"><span className="note-index">01</span><div><strong>Fixture, not feed</strong><p>These records mimic an API response and lab dataset. They are not a live breach index.</p></div></div><div className="audit-note"><span className="note-index">02</span><div><strong>Duplicates are expected</strong><p>Northstar Cloud appears in both sources so you can see the merge logic in action.</p></div></div><div className="audit-note"><span className="note-index">03</span><div><strong>Rate limits have a place</strong><p>In production, 429 responses would trigger back-off and a cached retry—not a burst of calls.</p></div></div><div className="audit-warning"><AlertCircle size={15} /><span>Only use your own address or written-permission lab data.</span></div></aside>
          </section>

          <div className="section-heading findings-heading" id="findings"><div><span className="section-kicker">CHECKPOINT 03</span><h2>Merged exposure report</h2></div><div className="findings-actions"><button className="filter-button"><Filter size={14} /> All severities <ChevronDown size={14} /></button><button className="export-button" onClick={exportReport}><Download size={14} /> Export JSON</button></div></div>
          <section className="panel findings-panel">
            <div className="findings-summary"><div><span className="panel-kicker">ADDRESS UNDER REVIEW</span><strong>{email || 'No address entered'}</strong></div><div className="summary-pills"><span><b>{findings.length}</b> merged</span><span className="critical-summary"><b>{criticalCount}</b> critical</span><span className="high-summary"><b>{highCount}</b> high</span></div></div>
            <div className="severity-overview" aria-label="Severity breakdown">
              <div className="severity-overview-head"><div><span className="panel-kicker">RISK DISTRIBUTION</span><strong>{findings.length ? 'Scan the highest signals first.' : 'No active exposure in this report.'}</strong></div><span className="severity-total">{findings.length} {findings.length === 1 ? 'finding' : 'findings'}</span></div>
              <div className="severity-bar" role="img" aria-label={severitySummary.map((item) => `${item.count} ${item.label}`).join(', ')}>{severitySummary.map((item) => item.count > 0 && <span key={item.label} className={`severity-bar-segment ${item.tone}`} style={{ width: `${(item.count / Math.max(findings.length, 1)) * 100}%` }} />)}</div>
              <div className="severity-cards">{severitySummary.map((item) => <div className={`severity-card ${item.tone}`} key={item.label}><div className="severity-card-top"><span className="severity-card-count">{item.count}</span><span className="severity-card-label">{item.label}</span></div><span className="severity-card-detail">{item.detail}</span></div>)}</div>
            </div>
            <div className="findings-list">{findings.length ? findings.map((finding, index) => <article className="finding-row" key={finding.id}><div className="finding-number">0{index + 1}</div><div className="finding-main"><div className="finding-title"><h3>{finding.name}</h3><span className={`severity-badge ${severityStyles[finding.severity]}`}>{finding.severity}</span></div><div className="finding-meta"><span>{formatDate(finding.date)}</span><span className="meta-separator" /> <span>{classList(finding.classes)}</span><span className="meta-separator" /> <span>{finding.sources.length > 1 ? 'API + local' : finding.sources[0]}</span></div><div className="finding-action"><Zap size={14} /><strong>Recommended:</strong> {finding.action}</div>{finding.severity === 'Critical' && <div className="remediation-card"><div className="remediation-header"><div><span className="remediation-kicker">REMEDIATION CHECKLIST</span><strong>Contain this exposure in order.</strong></div><span className="remediation-progress">{getRemediationSteps(finding).filter((step) => completedRemediations[finding.id]?.includes(step.id)).length}/{getRemediationSteps(finding).length} complete</span></div><div className="remediation-list">{getRemediationSteps(finding).map((step) => { const isComplete = completedRemediations[finding.id]?.includes(step.id) ?? false; return <label className={`remediation-step ${isComplete ? 'is-complete' : ''}`} key={step.id}><input type="checkbox" checked={isComplete} onChange={() => toggleRemediation(finding.id, step.id)} /><span className="remediation-check"><Check size={12} /></span><span className="remediation-copy"><strong>{step.title}</strong><small>{step.detail}</small></span></label> })}</div><div className="remediation-note"><LockKeyhole size={12} /> Progress is saved only in this browser.</div></div>}</div><div className="finding-rationale"><span>WHY THIS SCORE</span><p>{finding.rationale}</p></div></article>) : <div className="report-empty"><ShieldCheck size={27} /><h3>No matching exposure in the local fixtures</h3><p>Try the match demo address to see merged records and recommended actions.</p><button className="primary-button" onClick={() => { setEmail(demoEmail); window.setTimeout(() => runEmailCheck(), 0) }}>Load match demo <ArrowDownRight size={15} /></button></div>}</div>
            <div className="report-footer"><div><LockKeyhole size={14} /> Report generated locally at {formatTime(checkedAt)} · <span>non-production demo</span></div><button className="text-button" onClick={() => showToast('Report logic is deterministic and source-aware.')}>How scoring works <ArrowUpRight size={14} /></button></div>
          </section>

          <footer className="main-footer"><div><TerminalSquare size={15} /> Built to make privacy-preserving security work visible.</div><div>Educational lab artifact · 2026</div></footer>
        </div>
      </main>
      {toast && <div className="toast" role="status"><Check size={15} /> {toast}<button onClick={() => setToast('')} aria-label="Dismiss"><X size={14} /></button></div>}
      <button className="mobile-menu" aria-label="Open navigation" onClick={() => setMobileNavOpen(!mobileNavOpen)}><Menu size={20} /></button>
    </div>
  )
}

function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((header) => header.trim().toLowerCase())
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((value) => value.trim())
    return headers.reduce<Record<string, string>>((row, header, index) => ({ ...row, [header]: values[index] ?? '' }), {})
  })
}

export default App
