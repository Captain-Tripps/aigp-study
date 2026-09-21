/**
 * AIGP Playbook content source for PI-grounded generation.
 *
 * The Playbook (aigpplaybook.com) has 9 articles with deep exam-relevant
 * content. Rather than telling the LLM to "reference" a URL (which it
 * cannot actually read), we extract the relevant content per PI and inject
 * it directly into the prompt. This is what produces deep, source-grounded
 * study material instead of generic summaries.
 *
 * Each PI maps to one or more "source" strings below. The generator loads
 * only the sources mapped to that PI, keeping prompts focused and within
 * context limits.
 */

// ---------------------------------------------------------------------------
// Source articles (extracted from aigpplaybook.com, May–June 2026)
// ---------------------------------------------------------------------------

export const SOURCES: Record<string, { title: string; url: string; content: string }> = {
  frameworks: {
    title: 'AI Governance Frameworks Compared: NIST, EU AI Act, OECD & ISO 42001',
    url: 'https://aigpplaybook.com/blog/ai-governance-frameworks-compared',
    content: `# AI Governance Frameworks Compared: NIST, EU AI Act, OECD & ISO 42001

There is no single global standard for AI governance. Organisations must navigate a patchwork of frameworks, regulations, and standards, each with different scope, authority, and requirements. For the AIGP exam, you need to know the four most important ones and be able to distinguish between them in scenario-based questions.

Quick answer: The four key AI governance frameworks differ by authority and purpose. The EU AI Act is binding law that classifies AI by risk. The NIST AI RMF is a voluntary process for managing AI risk (Govern, Map, Measure, Manage). The OECD AI Principles are values-based and non-binding. ISO 42001 is a certifiable management-system standard. Most mature organisations use them together rather than choosing one.

## Quick Comparison Overview
| Framework | Origin | Binding? | Scope | Primary Focus |
|---|---|---|---|---|
| EU AI Act | European Union | Yes (law) | Any AI affecting EU residents | Risk classification and legal compliance |
| NIST AI RMF | United States | Voluntary | Any organisation globally | Risk management process |
| OECD AI Principles | OECD (42 countries) | Voluntary | Governments and organisations | Values-based principles for trustworthy AI |
| ISO 42001 | International (ISO) | Voluntary (certifiable) | Any organisation | AI management system standard |

## 1. EU AI Act (Legally Binding)
The EU AI Act (Regulation (EU) 2024/1689) is the world's first comprehensive AI law. It classifies AI systems into four risk tiers and imposes legal obligations on providers and deployers based on risk level.

Core structure:
- Prohibited practices: outright bans on AI that poses unacceptable risk (social scoring, subliminal manipulation)
- High-risk systems: conformity assessment, documentation, human oversight, registration
- Limited risk: transparency obligations only (e.g. chatbots must disclose they are AI)
- Minimal risk: no requirements

Who it applies to: Any organisation placing AI systems on the EU market or using AI in a way that affects EU residents, regardless of where the organisation is headquartered.

AIGP exam relevance: Heavily tested. You must know the risk tiers, prohibited practices, high-risk categories, and GPAI model rules.

## 2. NIST AI Risk Management Framework (AI RMF) (Voluntary)
Published by the US National Institute of Standards and Technology in January 2023, the NIST AI RMF is a voluntary framework that helps organisations identify, assess, and manage AI risks throughout the AI lifecycle. It is widely adopted across sectors globally, not just in the US.

Core structure: the four functions:
- GOVERN: establish the culture, policies, and accountability structures for AI risk management
- MAP: identify and categorise AI risks in context
- MEASURE: analyse and assess identified risks using metrics and tools
- MANAGE: prioritise and treat risks, implement responses, monitor outcomes

Key characteristics:
- Voluntary and flexible, not prescriptive
- Applies to the full AI lifecycle
- Emphasises trustworthiness across six properties: valid, reliable, safe, secure, explainable, fair, privacy-enhanced, and accountable
- Includes an AI RMF Playbook with practical implementation guidance

AIGP exam relevance: You need to know the four core functions (Govern, Map, Measure, Manage) and the trustworthiness properties. Questions often ask you to identify which function a specific activity belongs to.

## 3. OECD AI Principles (Voluntary)
Adopted in 2019 and updated in 2024, the OECD AI Principles were the first intergovernmental standard on AI, endorsed by 42 countries. They are values-based principles rather than a compliance framework.

The five principles:
- Inclusive growth and sustainable development: AI should benefit people and the planet
- Human-centred values and fairness: AI must respect human rights and democratic values
- Transparency and explainability: stakeholders should be able to understand AI outcomes
- Robustness, security and safety: AI systems should function reliably and safely throughout their lifecycle
- Accountability: AI actors should be responsible for proper functioning and respect of these principles

Key characteristics:
- High-level and principles-based, not operational
- Aimed at governments and policy makers as well as organisations
- Primary goal: balance innovation with preventing societal harms
- Non-binding but widely referenced in national AI strategies

AIGP exam relevance: Often tested as a contrast to the EU AI Act. The OECD framework is broader and aspirational; the EU AI Act is specific and legally enforceable. Questions may ask you to identify the primary goal of the OECD framework (balancing harm prevention with fostering innovation).

## 4. ISO 42001 (Certifiable Standard)
Published in December 2023, ISO/IEC 42001 is the first international standard for AI management systems (AIMS). Like ISO 27001 for information security, it provides a certifiable framework that organisations can implement and have independently audited.

Core structure:
- Follows the standard ISO high-level structure (Plan-Do-Check-Act)
- Requires organisations to establish an AI management system with defined policies, roles, and processes
- Covers: AI policy, risk and impact assessment, operational controls, performance evaluation, and continual improvement
- Includes annexes on AI risk management and AI system impact assessment

Key characteristics:
- Voluntary but certifiable by accredited bodies
- Applies to any organisation that develops or uses AI
- Complements the EU AI Act and NIST AI RMF rather than replacing them
- Provides a management system layer on top of technical standards

AIGP exam relevance: Know that ISO 42001 is a management system standard (not a technical standard) and that it is certifiable. It is often tested alongside ISO 27001 comparisons and as a contrast to voluntary frameworks.

## How They Work Together
These frameworks are not mutually exclusive. In practice, a well-governed organisation would typically:
- Comply with the EU AI Act for legal obligations (if operating in or affecting the EU)
- Use the NIST AI RMF as the operational framework for managing AI risk day to day
- Align values and principles with the OECD AI Principles
- Pursue ISO 42001 certification to demonstrate governance maturity to stakeholders

Exam tip: A common question asks which framework a specific activity belongs to. NIST is about process (Govern/Map/Measure/Manage). OECD is about principles. ISO 42001 is about management systems. EU AI Act is about legal compliance and risk classification.

## Singapore Model AI Governance Framework
Worth mentioning as a fifth framework that appears in AIGP exam questions. Published by Singapore's IMDA and PDPC, it is a voluntary, practical framework focused on two core principles:
- Internal governance: organisations should have clear accountability and human oversight
- Human-centric AI: decisions that significantly affect individuals should have human review

It is most often tested as a contrast to the EU AI Act: Singapore's approach is voluntary and principles-based, while the EU's is mandatory and prescriptive.

## AIGP vs ISO 42001: What's the Difference?
AIGP: A professional certification for an individual. Awarded by IAPP, via a proctored exam. Proves that you understand AI governance. Renewal via continuing education credits (CPE).
ISO 42001: A management system standard for an organisation. Awarded by an accredited certification body, via audit. Proves that your organisation has a working AI management system. Renewal via surveillance audits and recertification.

In one line: a person earns an AIGP; an organisation certifies to ISO 42001. They are complementary. An AIGP-certified professional is often exactly the person who helps an organisation implement and maintain an ISO 42001 management system. For the exam, know that ISO 42001 itself is part of the AIGP body of knowledge.

## ISO 42001 vs NIST AI RMF: Which Should You Use?
Both are voluntary and widely adopted, but they play different roles, and most mature programmes use them together rather than choosing one.
- ISO 42001: Certifiable management system standard. Origin: ISO/IEC (international). Structure: Plan-Do-Check-Act management system. Can you be certified? Yes, by an accredited body. Best used as: the auditable governance layer for stakeholders.
- NIST AI RMF: Voluntary risk-management framework. Origin: NIST (United States). Structure: Four functions: Govern, Map, Measure, Manage. Can you be certified? No formal certification. Best used as: the day-to-day operational method for managing AI risk.

A practical pattern: run your operations using the NIST AI RMF, then pursue ISO 42001 certification to formally evidence that those operations meet an auditable standard. They reinforce each other.`,
  },

  euaiact: {
    title: 'EU AI Act Explained in Plain English',
    url: 'https://aigpplaybook.com/blog/eu-ai-act-explained',
    content: `# EU AI Act Explained in Plain English

The EU AI Act (Regulation (EU) 2024/1689) is the world's first comprehensive legal framework for artificial intelligence. It applies to any organisation that develops, deploys, imports, or distributes AI systems that affect people in the European Union: regardless of where the organisation is based.

## The Core Idea: Risk-Based Regulation
The EU AI Act doesn't ban most AI: it classifies AI systems by risk level and applies proportionate obligations. The higher the potential harm, the stricter the rules. There are four tiers.

- Tier 1: Unacceptable Risk — Prohibited AI Practices. Banned outright. These systems pose an unacceptable threat to fundamental rights and human dignity.
- Tier 2: High Risk — Regulated: Conformity Assessment Required. Permitted but subject to strict obligations before they can be deployed. Must be registered in an EU database.
- Tier 3: Limited Risk — Transparency Obligations Only. Minimal requirements: mainly transparency (e.g. telling users they're interacting with an AI).
- Tier 4: Minimal Risk — No Specific Obligations. Spam filters, AI in video games, recommendation engines. No regulation required under the Act.

## Prohibited AI Practices (Tier 1)
These are banned from August 2026 onwards. They include:
- Social scoring by governments: using AI to score citizens based on social behaviour
- Real-time remote biometric identification in public spaces for law enforcement (with narrow exceptions)
- Subliminal manipulation: AI that exploits subconscious vulnerabilities to influence behaviour
- Exploitation of vulnerabilities: targeting people based on age, disability, or socioeconomic status
- Emotion recognition in workplaces and schools
- Untargeted scraping of facial images to build recognition databases
- Predictive policing based solely on profiling

Exam tip: A common trap is classifying social scoring as "high-risk" rather than "prohibited." It is banned outright: not regulated with extra requirements.

## High-Risk AI Systems (Tier 2)
High-risk AI systems can be deployed but require substantial compliance work. High-risk categories include:
- AI in critical infrastructure (energy, water, transport)
- Education and vocational training (e.g. automated exam marking, admissions)
- Employment (recruitment, performance monitoring, promotion decisions)
- Essential private and public services (credit scoring, insurance underwriting, benefits assessment)
- Law enforcement (risk assessments, evidence evaluation)
- Migration and asylum (border control AI, visa assessment)
- Administration of justice

Obligations for High-Risk Systems:
- Risk management system: Ongoing identification and mitigation of risks throughout the lifecycle
- Data governance: Training data must be relevant, representative, and free from bias
- Technical documentation: Full documentation before deployment and kept up to date
- Transparency and instructions: Users must be given clear information about the system's purpose and limitations
- Human oversight: Humans must be able to intervene and override AI decisions
- Accuracy, robustness and cybersecurity: Systems must meet performance standards throughout their lifecycle
- Conformity assessment: Third-party or self-assessment to verify compliance before market placement
- Registration: Must be registered in the EU AI database before deployment

## GPAI Models: A Separate Category
General Purpose AI (GPAI) models (like large language models) have their own set of rules under the Act. All GPAI model providers must:
- Maintain technical documentation
- Comply with EU copyright law
- Publish summaries of training data

GPAI models deemed to present systemic risk (trained with over 10^25 FLOPs) face additional requirements including adversarial testing and serious incident reporting.

## Who Does the EU AI Act Apply To?
The Act has broad extraterritorial reach. It applies to:
- Providers: organisations that develop or have AI systems developed and place them on the EU market
- Deployers: organisations that use AI systems in their operations within the EU
- Importers and distributors: those who bring AI systems into the EU market

This means a US company with no EU office is still subject to the Act if its AI affects EU citizens.

## Timeline
- August 2024: Act enters into force
- February 2025: Prohibited practices provisions apply
- August 2025: GPAI model obligations apply
- August 2026: High-risk AI system obligations apply (most provisions)
- August 2027: Obligations for certain high-risk systems in Annex I apply

## What This Means for the AIGP Exam
The EU AI Act is one of the most tested areas in the AIGP exam. Focus on:
- Correctly classifying AI systems into the right risk tier (especially distinguishing prohibited from high-risk)
- Knowing the specific obligations for high-risk systems
- Understanding GPAI model rules and the systemic risk threshold
- Knowing the roles of providers, deployers, importers, and distributors
- Being able to apply the Act to scenario-based questions`,
  },

  euaiactChecklist: {
    title: 'EU AI Act Compliance Checklist for Providers and Deployers',
    url: 'https://aigpplaybook.com/blog/eu-ai-act-checklist',
    content: `# EU AI Act Compliance Checklist 2026

The EU AI Act is now in force. Whether you are a provider building AI systems or a deployer putting them into use, you have legal obligations that apply now or will apply within months. This checklist gives you a structured, actionable view of what you need to do, organised by role and risk tier.

## Step 1: Identify Your Role
- Provider: Develops or places an AI system on the market or puts it into service, including via APIs
- Deployer: Uses an AI system under its own authority in a professional context
- Importer: Places on the EU market an AI system from a third country
- Distributor: Makes an AI system available on the EU market without modifying it

Note that one organisation can hold multiple roles simultaneously. A company that builds and deploys its own AI system is both a provider and a deployer.

## Step 2: Classify Your AI Systems
Prohibited AI Practices — confirm none of your systems:
- Use subliminal manipulation techniques
- Exploit vulnerabilities of specific groups (age, disability)
- Use real-time remote biometric identification in public spaces (except narrow law enforcement exceptions)
- Use social scoring by public authorities for general purposes
- Use AI-based profiling to predict criminal offences
- Use untargeted scraping of facial images for recognition databases
- Use emotion recognition in workplace or educational settings

High-Risk System Identification — check whether any of your systems fall into these categories:
- Biometric identification or categorisation of natural persons
- Management and operation of critical infrastructure
- Education and vocational training (access, evaluation, assessment)
- Employment, worker management, and access to self-employment
- Access to essential private and public services (credit scoring, benefits)
- Law enforcement, migration, asylum, or border control
- Administration of justice and democratic processes
- Safety components of products covered by EU product safety legislation

## Step 3: Provider Obligations for High-Risk Systems
Risk Management System (Provider):
- Establish a documented risk management system for the AI system
- Identify and analyse known and reasonably foreseeable risks
- Estimate and evaluate risks that may emerge in normal use and reasonably foreseeable misuse
- Adopt risk mitigation measures and document them
- Review and update the risk management system post-deployment

Data Governance (Provider):
- Apply data governance practices covering design choices, data collection, and preparation
- Ensure training, validation, and testing datasets meet quality criteria
- Document the origin, scope, and characteristics of datasets used
- Implement measures to detect and address biases in datasets
- Ensure datasets are relevant, representative, and free from errors where possible

Technical Documentation (Provider):
- Prepare technical documentation before placing the system on the market (Article 11)
- Include general description of the AI system and its intended purpose
- Document system components, algorithms, and logic
- Include training methodologies and datasets used
- Document validation and testing procedures and results
- Keep documentation updated throughout the system lifecycle

Transparency and Instructions (Provider):
- Provide instructions for use to deployers in a clear, understandable format
- Include information on the intended purpose, performance, and limitations
- Disclose the level of accuracy, robustness, and cybersecurity
- Describe human oversight measures required
- Provide information on foreseeable misuse and risks

Human Oversight (Provider):
- Design the system to allow human oversight during operation
- Enable operators to understand and monitor system outputs
- Include ability to override, interrupt, or shut down the system
- Ensure outputs are interpretable by the natural persons responsible

Registration and Conformity (Provider):
- Register the high-risk AI system in the EU database before placing on the market
- Complete the required conformity assessment procedure
- Draw up an EU declaration of conformity
- Affix the CE marking where applicable
- Appoint an authorised representative in the EU if established outside the EU

## Step 4: Deployer Obligations for High-Risk Systems
Use in Accordance with Instructions (Deployer):
- Use the AI system only for its intended purpose as documented by the provider
- Follow the instructions for use provided by the provider
- Do not modify the system in ways that alter its risk profile without re-assessment

Human Oversight and Monitoring (Deployer):
- Assign human oversight to natural persons with competence, authority, and resources
- Monitor system operation for risks and unexpected outputs
- Inform the provider if you detect a serious incident or malfunctioning
- Suspend or recall the system if it presents unacceptable risk

Transparency to Affected Persons (Deployer):
- Inform natural persons when they are subject to a high-risk AI system decision
- Provide information on the logic involved and significance of the output where required
- Conduct a Fundamental Rights Impact Assessment (FRIA) for public body deployments

Logging and Record-Keeping (Both):
- Retain logs generated by the high-risk AI system for a minimum of 6 months
- Make logs available to competent authorities upon request
- Document post-market monitoring findings

## Step 5: GPAI Model Obligations
If you provide a General Purpose AI (GPAI) model, additional obligations apply regardless of the downstream use case:
- Prepare and maintain technical documentation
- Make available information for downstream providers integrating your model
- Comply with copyright law and publish a summary of training data
- If the model has systemic risk (above 10^25 FLOPs training threshold): conduct adversarial testing, report serious incidents to the EU AI Office, and implement cybersecurity measures

## Key Deadlines
- Feb 2025: Prohibited AI practices provisions apply. Organisations must have eliminated any prohibited practices by this date.
- Aug 2025: GPAI model obligations and governance provisions apply. Providers of GPAI models must comply with transparency and documentation requirements.
- Aug 2026: High-risk AI system obligations under Annex I apply (products covered by existing EU product safety legislation).
- Aug 2027: Full application of all high-risk AI system obligations under Annex III. All providers and deployers of high-risk systems must be fully compliant.

## Penalties
Penalties are tiered, up to €35 million or 7% of global annual turnover for prohibited practices, with lower caps for other breaches. Non-compliance is expensive, which is why this checklist prioritises role and risk classification first.`,
  },

  roadmap: {
    title: 'AI Governance Roadmap: From Policy to Practice',
    url: 'https://aigpplaybook.com/blog/ai-governance-roadmap',
    content: `# AI Governance Roadmap: From Policy to Practice

An AI governance roadmap is a phased plan that moves an organisation from policy to practice in five stages: (1) Foundation: accountability and policy, (2) Risk Assessment, (3) Framework Implementation, (4) Monitoring and Measurement, and (5) Audit and Continuous Improvement. It turns governance from a one-off document into an operational system mapped to the NIST AI RMF, EU AI Act, and ISO 42001.

## Why Most AI Governance Efforts Stall
Organisations typically stall at one of three points: they produce a policy but fail to operationalise it; they build a risk framework but lack the data to populate it; or they complete an assessment but have no mechanism to act on findings. Each of these failures has the same root cause: governance was designed as a document exercise rather than an operational system.

Effective AI governance is not a policy. It is a set of repeatable processes, accountable roles, and feedback loops that keep AI systems aligned with organisational values and regulatory requirements over time.

## The Five-Phase Roadmap

### Phase 1: Foundation — Establish accountability and policy
Before assessing or classifying any AI system, establish who is responsible for AI governance and what the organisation's position on AI is.
- Appoint an AI governance lead or committee with clear accountability
- Define your AI Acceptable Use Policy: what is permitted, what is prohibited, and who approves exceptions
- Create an AI inventory: a register of all AI systems in use or development, including third-party tools
- Map roles under applicable regulations (provider, deployer, importer, distributor under the EU AI Act)
- Establish a governance review cadence: quarterly minimum

### Phase 2: Risk Assessment — Classify and prioritise AI systems by risk
Use the EU AI Act risk tiers as your primary classification framework, supplemented by the NIST AI RMF Map function for contextual risk identification.
- Classify each AI system: prohibited, high-risk, limited transparency, or minimal risk
- Conduct an AI Impact Assessment (AIA) for high-risk systems
- Complete DPIAs for systems processing personal data at scale
- Document identified risks in a risk register with likelihood, severity, and ownership
- Prioritise remediation based on residual risk, not inherent risk alone

### Phase 3: Framework Implementation — Operationalise controls across the AI lifecycle
Governance controls must be embedded at each stage of the AI lifecycle: design, development, deployment, and operation. A control that only exists at deployment is too late to prevent many risks.
- Apply NIST AI RMF Govern and Manage functions to embed controls in development workflows
- Implement human oversight mechanisms for high-risk systems
- Define incident response procedures for AI failures or unexpected outputs
- Establish data governance: training data provenance, quality checks, and retention
- Document technical documentation requirements per EU AI Act Article 11

### Phase 4: Monitoring and Measurement — Track performance, drift, and compliance
Governance without monitoring is a policy, not a programme. The NIST AI RMF Measure function and EU AI Act post-market monitoring obligations both require ongoing tracking of AI system behaviour.
- Define key performance indicators for each high-risk AI system
- Monitor for model drift: degradation in accuracy or fairness over time
- Track bias indicators across demographic groups where relevant
- Log incidents, near-misses, and user complaints in a structured format
- Report to the governance committee on a defined schedule

### Phase 5: Audit and Continuous Improvement — Test, verify, and iterate
Governance must be audited, not just maintained. Internal audits verify that controls are working as intended. External audits provide independent assurance. Both are required for high-risk systems under the EU AI Act.
- Conduct internal audits of high-risk systems against documented controls
- Commission third-party conformity assessments where required by regulation
- Review and update risk assessments after significant model changes
- Feed audit findings back into Phase 1 policy review
- Build a culture of accountability: governance fails when it is treated as a compliance checkbox

## How the Major Frameworks Map to This Roadmap
| Phase | NIST AI RMF | EU AI Act | ISO 42001 |
|---|---|---|---|
| Foundation | Govern | Roles and obligations | Context and leadership |
| Risk Assessment | Map | Risk classification, AIA, DPIA | Risk assessment |
| Implementation | Manage | Technical documentation, human oversight | Controls and treatment |
| Monitoring | Measure | Post-market monitoring | Performance evaluation |
| Audit | Govern (review) | Conformity assessment | Internal audit, improvement |

## Common Mistakes to Avoid
- Starting with a policy document instead of an inventory. You cannot govern what you have not identified.
- Treating risk classification as a one-time exercise. AI systems evolve. Risk classification must be reviewed when systems change significantly.
- Assigning governance to a single team with no executive sponsorship. Governance without authority cannot enforce controls.
- Conflating compliance with governance. Compliance is the minimum required by law. Governance is the operational system that makes AI trustworthy beyond compliance.
- Skipping decommissioning. AI systems that are retired without proper data disposal and documentation create long-tail risk.

## AI Policy Roadmap vs AI Compliance Roadmap
- AI policy roadmap focuses on Phase 1: defining your acceptable-use policy, accountability structures, and the principles that govern how AI is built and used. This is where you decide what your organisation will and will not do with AI.
- AI compliance roadmap focuses on meeting specific legal obligations, above all the EU AI Act, but also GDPR where AI processes personal data. It maps to Phases 2 through 5: risk classification, documentation, monitoring, and conformity assessment.

A complete AI governance roadmap contains both. Policy without compliance is aspirational; compliance without policy is brittle. The five-phase model sequences them so that policy sets direction and compliance activities give it teeth.`,
  },

  aigpVsIso: {
    title: 'AIGP vs ISO 42001: What is the Difference?',
    url: 'https://aigpplaybook.com/blog/aigp-vs-iso-42001',
    content: `# AIGP vs ISO 42001: What's the Difference?

"AIGP vs ISO 42001" contains a hidden trap: the two are not competing alternatives. They are different kinds of things. One is a certification for a person; the other is a standard for an organisation.

In one line: a person earns an AIGP; an organisation certifies to ISO 42001. They complement each other, they do not compete.

## What Is the AIGP?
The AIGP (Artificial Intelligence Governance Professional) is a professional certification awarded by the IAPP to an individual who passes a proctored exam. It proves that you understand how to govern AI: applicable regulations like the EU AI Act, frameworks like the NIST AI RMF and ISO 42001, AI risk management, fairness, and impact assessments. It is a credential you put after your name.

## What Is ISO 42001?
ISO/IEC 42001 is the first international standard for AI management systems (AIMS), published in December 2023. It is a certifiable standard: an organisation implements an AI management system, then an accredited body audits it and issues certification. Think of it like ISO 27001 for information security, but for AI governance. It proves that a company has a working, auditable system, not that any individual is qualified.

## Side by Side
- AIGP: Professional certification. Held by an individual person. Awarded by IAPP, via a proctored exam. Proves you understand AI governance. How you get it: study and pass one exam. Renewal: continuing education (CPE) credits. Typical cost: ~$799 exam.
- ISO 42001: AI management system standard. Held by an organisation. Awarded by an accredited certification body, via audit. Proves your organisation runs a sound AI management system. How you get it: implement a management system, then pass an audit. Renewal: surveillance audits and recertification. Typical cost: varies widely; implementation + audit fees.

## Should You Get AIGP or Pursue ISO 42001?
Ask one question: are you trying to credential yourself, or your organisation?
- Choose the AIGP if you are an individual who wants to prove personal expertise and improve career prospects in AI governance.
- Pursue ISO 42001 if you represent an organisation that wants to demonstrate a mature, independently audited AI management system to customers, regulators, or partners.

In most real programmes they reinforce each other: the AIGP-certified professional is frequently the very person who designs and leads the organisation's ISO 42001 implementation.

Exam note: ISO 42001 is part of the AIGP body of knowledge. So preparing for the AIGP will teach you what ISO 42001 is, where it fits among the NIST AI RMF, EU AI Act, and OECD Principles, and how organisations use it.`,
  },

  howToPrepare: {
    title: 'How to Prepare for the AIGP Exam',
    url: 'https://aigpplaybook.com/blog/how-to-prepare-for-aigp',
    content: `# How to Prepare for the AIGP Exam

The AIGP exam is not a memory test. It is a judgment test. Most candidates who fail do so not because they lack knowledge, but because they have not practised applying that knowledge to real-world scenarios under time pressure.

## Understand What the Exam Actually Tests
The AIGP exam consists of 100 multiple-choice questions, of which 85 are scored and 15 are unscored experimental questions. You have 2.5 hours. Questions are scenario-based: they present a situation and ask you to identify the best course of action, the correct framework, or the right risk classification.

The key word is best. Multiple options may be partially correct. The exam tests whether you can identify the most appropriate response given the specific context, not just whether you recognise a concept.

## The Five Core Study Areas

### 1. EU AI Act
This is the most heavily tested topic. You need to know all four risk tiers (prohibited, high-risk, limited transparency, minimal risk), the specific prohibited practices, which categories of systems are classified as high-risk, GPAI model obligations, and the roles of provider, deployer, importer, and distributor.

### 2. NIST AI RMF
Know the four core functions: Govern, Map, Measure, Manage. Understand what each function covers and how they interact. Questions often test whether you can identify which function a specific activity belongs to.

### 3. AI Risk Management
Risk identification, assessment, treatment, and documentation. Know the difference between inherent and residual risk. Understand when a risk register is required and what it must contain.

### 4. AI Lifecycle and Governance
Design, development, deployment, monitoring, and decommissioning. Know which governance controls apply at each stage and what model drift means in practice.

### 5. Privacy and Data Protection
GDPR application to AI systems. Data minimisation, purpose limitation, DPIAs, and the legal bases for processing training data. Know when a DPIA is required for an AI system.

## Common Traps to Watch For
- Wrong tier: Treating a prohibited practice as merely high-risk, or vice versa
- Wrong sequence: Identifying the right action but at the wrong stage of the lifecycle
- Wrong regulation: Applying GDPR logic to an EU AI Act question, or NIST to a legal compliance question
- Symptom vs. root cause: Choosing an option that addresses a visible symptom rather than the underlying governance failure
- Scope confusion: Misidentifying who has obligations under the EU AI Act (provider vs. deployer)

## Exam Day Tips
- Flag questions you are unsure about and return to them. Do not spend more than 2 minutes on any single question on the first pass.
- Read every option before selecting. The exam is designed to catch candidates who stop reading after finding a plausible-sounding option.
- When two options seem equally valid, ask which one is more upstream, more governance-focused, or more risk-preventive. That is usually the correct answer.
- Trust your preparation. Second-guessing correct answers is one of the most common sources of lost marks.`,
  },

  whatIsAigp: {
    title: 'What Is the AIGP Certification?',
    url: 'https://aigpplaybook.com/blog/what-is-aigp-certification',
    content: `# What Is the AIGP Certification?

AIGP stands for Artificial Intelligence Governance Professional. It is a professional certification offered by the IAPP (International Association of Privacy Professionals): the same body behind the CIPP, CIPM, and CIPT privacy certifications held by hundreds of thousands of professionals worldwide.

The AIGP was designed to meet surging demand for professionals who understand AI governance: not just the technical side, but the legal, ethical, organisational, and risk dimensions. It's a vendor-neutral, globally recognised credential.

In short: The AIGP proves you understand how to govern AI systems responsibly across the full lifecycle: from design to deployment to decommissioning.

## What Does the AIGP Exam Cover?
The AIGP exam is structured around several core domains. Based on the current IAPP body of knowledge, the key areas include:
- AI Fundamentals: Types of AI, ML lifecycle, training data, model evaluation
- EU AI Act: Risk tiers, obligations, prohibited practices, GPAI models
- AI Governance Frameworks: NIST AI RMF, OECD Principles, ISO 42001, Singapore Model
- Privacy and Data Protection: GDPR application to AI, data minimisation, DPIAs
- AI Fairness and Bias: Bias types, auditing, fairness metrics, remediation
- AI Risk Management: Risk identification, assessment, registers, mitigation
- AI Lifecycle Management: Design, deployment, monitoring, model drift, decommissioning
- AI Ethics: Transparency, accountability, explainability, human oversight
- AI Auditing: Audit types, scope, processes, documentation
- Impact Assessments: AIAs, FRIAs, DPIAs: when required and what they cover

## How Hard Is the AIGP Exam?
The exam is genuinely challenging for unprepared candidates. Questions are scenario-based: they don't just test whether you know a definition, they test whether you can apply the right framework in a real-world situation.

Common traps include:
- Confusing risk tiers (e.g. treating prohibited AI practices as merely high-risk)
- Applying the wrong regulation to a scenario (GDPR vs EU AI Act vs NIST)
- Selecting a correct concept that belongs to the wrong domain or phase
- Choosing a response that addresses symptoms rather than root causes

Exam format: 100 multiple-choice questions total, of which 85 are scored and 15 are unscored experimental questions used to validate future exam items. Available at IAPP-approved testing centres and online proctored.`,
  },
}

// ---------------------------------------------------------------------------
// PI → source mapping
// ---------------------------------------------------------------------------

/**
 * Maps each of the 58 BOK PIs to the Playbook sources that ground it.
 *
 * The mapping is based on the BOK competency/PI descriptions and the
 * content covered in each Playbook article. A PI may map to multiple
 * sources when its content spans several topics.
 */
export const PI_SOURCES: Record<string, string[]> = {
  // === Module 1: AI Fundamentals (Domain I) ===
  'I.A.1': ['whatIsAigp', 'howToPrepare'],
  'I.A.2': ['euaiact', 'roadmap'],
  'I.A.3': ['euaiact', 'frameworks'],
  'I.A.4': ['frameworks', 'howToPrepare'],

  // === Module 2: AI Governance Structure (Domain I) ===
  'I.B.1': ['roadmap', 'euaiactChecklist'],
  'I.B.2': ['roadmap', 'frameworks'],
  'I.B.3': ['roadmap', 'whatIsAigp'],
  'I.B.4': ['roadmap', 'frameworks'],
  'I.B.5': ['euaiact', 'euaiactChecklist'],

  // === Module 3: AI Policies & Standards (Domain I) ===
  'I.C.1': ['roadmap', 'frameworks'],
  'I.C.2': ['roadmap', 'euaiactChecklist'],
  'I.C.3': ['roadmap', 'euaiactChecklist'],

  // === Module 4: Legal & Regulatory (Domain II) ===
  'II.A.1': ['euaiact', 'roadmap'],
  'II.A.2': ['euaiact', 'roadmap'],
  'II.A.3': ['euaiact', 'euaiactChecklist'],
  'II.A.4': ['euaiact', 'euaiactChecklist'],
  'II.B.1': ['euaiact', 'frameworks'],
  'II.B.2': ['euaiact', 'euaiactChecklist'],
  'II.B.3': ['euaiact', 'frameworks'],
  'II.B.4': ['euaiact', 'euaiactChecklist'],
  'II.C.1': ['euaiact', 'euaiactChecklist'],
  'II.C.2': ['euaiactChecklist', 'frameworks'],
  'II.C.3': ['euaiact', 'euaiactChecklist'],
  'II.C.4': ['euaiact', 'euaiactChecklist'],
  'II.C.5': ['euaiactChecklist', 'euaiact'],
  'II.C.6': ['euaiact', 'euaiactChecklist'],
  'II.D.1': ['frameworks'],
  'II.D.2': ['frameworks', 'howToPrepare'],
  'II.D.3': ['frameworks', 'aigpVsIso'],

  // === Module 5: AI Risk Management (Domain II) ===
  'III.A.1': ['roadmap', 'euaiact'],
  'III.A.2': ['roadmap', 'euaiactChecklist'],
  'III.A.3': ['roadmap', 'euaiactChecklist'],
  'III.A.4': ['roadmap', 'euaiactChecklist'],
  'III.A.5': ['roadmap', 'euaiactChecklist'],
  'III.B.1': ['euaiactChecklist', 'roadmap'],
  'III.B.2': ['euaiactChecklist', 'roadmap'],
  'III.B.3': ['roadmap', 'euaiactChecklist'],
  'III.B.4': ['roadmap', 'euaiactChecklist'],
  'III.B.5': ['roadmap', 'euaiactChecklist'],
  'III.C.1': ['roadmap', 'euaiactChecklist'],
  'III.C.2': ['roadmap', 'frameworks'],
  'III.C.3': ['roadmap', 'frameworks'],
  'III.C.4': ['roadmap', 'euaiactChecklist'],
  'III.C.5': ['roadmap', 'euaiactChecklist'],
  'III.C.6': ['roadmap', 'euaiactChecklist'],

  // === Module 6: AI Lifecycle (Domain III) ===
  // (covered by III.A-III.C above)

  // === Module 7: AI Deployment & Operations (Domain IV) ===
  'IV.A.1': ['euaiact', 'roadmap'],
  'IV.A.2': ['euaiact', 'frameworks'],
  'IV.A.3': ['euaiact', 'frameworks'],
  'IV.B.1': ['roadmap', 'euaiactChecklist'],
  'IV.B.2': ['roadmap', 'euaiactChecklist'],
  'IV.B.3': ['roadmap', 'frameworks'],
  'IV.C.1': ['roadmap', 'euaiactChecklist'],
  'IV.C.2': ['roadmap', 'frameworks'],
  'IV.C.3': ['roadmap', 'frameworks'],
  'IV.C.4': ['roadmap', 'euaiactChecklist'],
  'IV.C.5': ['roadmap', 'euaiactChecklist'],
  'IV.C.6': ['roadmap', 'euaiactChecklist'],
  'IV.C.7': ['roadmap', 'euaiactChecklist'],
}

/**
 * Build the source-grounding text for a PI's prompt.
 * Returns a string of the relevant Playbook content, or a fallback
 * message if no sources are mapped.
 */
export function buildSourceGrounding(piCode: string): string {
  const sourceKeys = PI_SOURCES[piCode]
  if (!sourceKeys || sourceKeys.length === 0) {
    return 'No specific Playbook source is mapped to this PI. Use general AIGP knowledge grounded in the IAPP body of knowledge.'
  }

  const parts: string[] = []
  for (const key of sourceKeys) {
    const source = SOURCES[key]
    if (source) {
      parts.push(`### Source: ${source.title}\nURL: ${source.url}\n\n${source.content}`)
    }
  }

  if (parts.length === 0) {
    return 'No specific Playbook source is mapped to this PI. Use general AIGP knowledge grounded in the IAPP body of knowledge.'
  }

  return parts.join('\n\n---\n\n')
}

/**
 * Get the total character count of sources for a PI (useful for debugging).
 */
export function sourceCharCount(piCode: string): number {
  const sourceKeys = PI_SOURCES[piCode]
  if (!sourceKeys) return 0
  return sourceKeys.reduce((sum, key) => {
    const source = SOURCES[key]
    return sum + (source ? source.content.length : 0)
  }, 0)
}
