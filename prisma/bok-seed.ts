import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type PI = string

type CompetencyDef = {
  code: string
  title: string
  description: string
  moduleName: number
  domainNum: string
  pis: PI[]
}

const competencies: CompetencyDef[] = [
  {
    code: 'I.A',
    title: 'Foundations of AI',
    description: 'Understand what AI is and why it needs governance.',
    moduleName: 1,
    domainNum: 'I',
    pis: [
      'Know the generally accepted definitions and types of AI.',
      'Identify the types of risks and harms posed by AI to individuals, groups, organizations and society (e.g., misalignment with objectives, ethics and bias risk, and complexity and scalability).',
      'Identify the unique characteristics of AI that require a comprehensive approach to governance (e.g., complexity, opacity, autonomy, speed and scale, potential for harm or misuse, data dependency, and probabilistic versus deterministic outputs).',
      'Identify and apply the common principles of responsible AI (e.g., fairness, safety and reliability, privacy and security, transparency and explainability, accountability and human-centricity).',
    ],
  },
  {
    code: 'I.B',
    title: 'Responsible AI Principles and Governance Expectations',
    description: 'Establish and communicate organizational expectations for AI governance.',
    moduleName: 2,
    domainNum: 'I',
    pis: [
      'Define roles and responsibilities for AI governance stakeholders.',
      'Establish cross-functional collaboration in the AI governance program (e.g., for efficacy and diversity of expertise and perspective).',
      'Create and deliver a training and awareness program to all stakeholders on AI terminology, strategy and governance.',
      'Differentiate approaches to AI governance based upon company size, maturity, industry, products and services, objectives and risk tolerance.',
      'Identify differences among AI developers, providers, deployers and users from a governance perspective (e.g., with respect to responsibilities, opportunities and needs).',
    ],
  },
  {
    code: 'I.C',
    title: 'AI Governance and Risk Management',
    description: 'Establish policies and procedures to apply throughout the AI life cycle.',
    moduleName: 3,
    domainNum: 'I',
    pis: [
      'Create and implement policies to ensure oversight and accountability across all AI life cycle stages (e.g., use case assessment, risk management, ethics by design, data acquisition and use, model and system development, training and testing, deployment and monitoring, documentation and reporting, and incident management).',
      'Evaluate and update existing policies (e.g., data privacy, security, data governance and intellectual property) for AI.',
      'Create, update and implement policies, assessments and contracts to manage third-party risk (e.g., procurement, supply chain, human resources and acceptable use).',
    ],
  },
  {
    code: 'II.A',
    title: 'Data Privacy Laws and AI',
    description: 'Understand how existing data privacy laws apply to AI.',
    moduleName: 4,
    domainNum: 'II',
    pis: [
      'Understand how transparency, choice, lawful basis and purpose limitation requirements apply to AI.',
      'Understand how data minimization and privacy by design requirements apply to AI.',
      'Understand how obligations on data controllers apply to AI (e.g., regarding privacy impact assessments, use of third-party processors, cross-border data transfers, data subject rights, automated decision making, incident management, breach notification and record keeping).',
      'Understand the requirements that apply to sensitive or special categories of data (e.g., biometrics).',
    ],
  },
  {
    code: 'II.B',
    title: 'Other Existing Laws and AI',
    description: 'Understand how other types of existing laws apply to AI.',
    moduleName: 4,
    domainNum: 'II',
    pis: [
      'Understand how intellectual property laws apply to AI (e.g., prohibiting or limiting use of data for AI training).',
      'Understand how nondiscrimination laws apply to AI (e.g., in the employment, credit, lending, housing and insurance contexts).',
      'Understand how consumer protection laws apply to AI (e.g., prohibiting unfair and deceptive acts or practices).',
      'Understand how product liability laws apply to AI (e.g., prohibiting design and manufacturing defects).',
    ],
  },
  {
    code: 'II.C',
    title: 'AI-Specific Laws',
    description: 'Understand the main elements of AI-specific laws.',
    moduleName: 5,
    domainNum: 'II',
    pis: [
      'Understand the risk classification framework for AI (e.g., prohibited/high/limited/minimal risk) and what systems/uses fall into each category.',
      'Understand the key requirements around risk management, data governance, technical documentation, conformity/impact assessments and record keeping.',
      'Understand the key requirements around human oversight, transparency and notification, and quality management.',
      'Understand the distinct requirements for general-purpose AI models.',
      'Understand the enforcement framework and penalties for noncompliance.',
      'Understand the differences in requirements based on organizational context (e.g., providers, deployers, importers and distributors).',
    ],
  },
  {
    code: 'II.D',
    title: 'Industry Standards and Tools',
    description: 'Understand the main industry standards and tools that apply to AI.',
    moduleName: 5,
    domainNum: 'II',
    pis: [
      'Understand the Organisation for Economic Co-operation and Development (OECD) principles, framework, policies and recommended practices for trustworthy AI.',
      'Understand the NIST AI Risk Management Framework and Playbook (e.g., core functions, categories and subcategories).',
      'Understand the core ISO AI standards (i.e., 22989, 42001 and 42005).',
    ],
  },
  {
    code: 'III.A',
    title: 'Governing AI Design and Building',
    description: 'Govern the designing and building of the AI system.',
    moduleName: 6,
    domainNum: 'III',
    pis: [
      'Define the business context and use case of the AI system.',
      'Perform or review an impact assessment on the AI system.',
      'Apply the policies, procedures, best practices and ethical considerations to designing and building the AI system (e.g., purpose of AI, requirements gathering, architecture and model selection, human oversight, data analysis, metric and threshold evaluation, stakeholder engagement and feedback, and operational controls).',
      'Identify and manage the internal and external risks and contributing factors related to designing and building the AI model and system (e.g., using probability/severity harms matrix, using a risk mitigation hierarchy, stakeholder mapping, use-case evaluation, benchmarking, and pre-deployment pilots and testing).',
      'Document the designing and building process (e.g., to establish compliance and manage risks).',
    ],
  },
  {
    code: 'III.B',
    title: 'Governing AI Data Collection and Use',
    description: 'Govern the collection and use of data in training and testing the AI model and system.',
    moduleName: 6,
    domainNum: 'III',
    pis: [
      'Establish and follow the requirements for data governance (e.g., assess and document lawful rights to collect and use data, and assess data quality, quantity, integrity and fit-for-purpose).',
      'Establish and document data lineage and provenance.',
      'Plan and perform training and testing of the AI model and system (e.g., unit, integration, validation, performance, security, bias and interpretability).',
      'Identify and manage issues and risks during training and testing of an the AI model and system.',
      'Document the training and testing process (e.g., to validate results, establish compliance and manage risks).',
    ],
  },
  {
    code: 'III.C',
    title: 'Governing AI Release, Monitoring and Maintenance',
    description: 'Govern the release, monitoring and maintenance of the AI system.',
    moduleName: 6,
    domainNum: 'III',
    pis: [
      'Assess readiness, and prepare for release into production (e.g., creating the model card and satisfying conformity requirements).',
      'Conduct continuous monitoring of the AI system, and establish a regular schedule for maintenance, updates and retraining.',
      'Conduct periodic activities to assess the AI system\'s performance, reliability and safety (e.g., audits, red teaming, threat modeling and security testing).',
      'Manage and document incidents, issues and risks.',
      'Collaborate with cross-functional stakeholders to understand why incidents arise from AI systems (e.g., brittleness, lack of robustness, lack of quality data, insufficient testing, and model or data drift).',
      'Make public disclosures to meet transparency obligations (e.g., technical documentation, instructions for use to deployers and post-market monitoring plans).',
    ],
  },
  {
    code: 'IV.A',
    title: 'Evaluating AI Deployment Factors and Risks',
    description: 'Evaluate key factors and risks relevant to the decision to deploy the AI system.',
    moduleName: 7,
    domainNum: 'IV',
    pis: [
      'Understand the context of the AI use case (e.g., business objectives, performance requirements, data availability, ethical considerations and workforce readiness).',
      'Understand the differences in AI model types (e.g., classic vs. generative, proprietary vs. open source, small vs. large, and language vs. multimodal capabilities).',
      'Understand the differences in AI deployment options (e.g., cloud vs. on-premise vs. edge, and using the AI model as is or with fine-tuning, retrieval augmented generation, agentic architectures, or other techniques to improve performance and fit).',
    ],
  },
  {
    code: 'IV.B',
    title: 'Assessing the AI System',
    description: 'Perform key activities to assess the AI system.',
    moduleName: 7,
    domainNum: 'IV',
    pis: [
      'Perform or review an impact assessment on the selected AI system.',
      'Identify and evaluate key terms and risks in the vendor or licensing agreement.',
      'Identify and understand the risks and opportunities that are unique to a company deploying its own proprietary AI model (e.g., increased obligations and higher potential liability).',
    ],
  },
  {
    code: 'IV.C',
    title: 'Governing AI Deployment and Use',
    description: 'Govern the deployment and use of the AI system.',
    moduleName: 7,
    domainNum: 'IV',
    pis: [
      'Apply the policies, procedures, best practices and ethical considerations to the deployment of an AI system (e.g., data governance, risk management, issue management, and user training).',
      'Conduct continuous monitoring of the AI model and system, and establish a regular schedule for maintenance, updates and retraining.',
      'Conduct periodic activities to assess the AI system\'s performance, reliability and safety (e.g., audits, red teaming, threat modeling and security testing).',
      'Document incidents, issues, risks and post-market monitoring plans.',
      'Forecast and reduce risks of secondary or unintended uses and downstream harms.',
      'Establish external communication plans.',
      'Create and implement a policy and controls to deactivate or localize an AI system as necessary (e.g., due to regulatory requirements or performance issues).',
    ],
  },
]

// Module -> set of domain roman numerals (derived from the competency mapping)
function deriveJunctions(): { moduleName: number; domainNum: string }[] {
  const seen = new Set<string>()
  const out: { moduleName: number; domainNum: string }[] = []
  for (const c of competencies) {
    const key = `${c.moduleName}|${c.domainNum}`
    if (!seen.has(key)) {
      seen.add(key)
      out.push({ moduleName: c.moduleName, domainNum: c.domainNum })
    }
  }
  return out
}

async function main() {
  const junctions = deriveJunctions()

  await prisma.$transaction(async (tx) => {
    // Step 1: wipe in FK-safe order
    await tx.contentChunkRevision.deleteMany()
    await tx.contentChunk.deleteMany()
    await tx.question.deleteMany()
    await tx.questionAttempt.deleteMany()
    await tx.flashcard.deleteMany()
    await tx.userProgress.deleteMany()
    await tx.performanceIndicator.deleteMany()
    await tx.competency.deleteMany()
    await tx.examDomainToModule.deleteMany()
    await tx.studyPlan.deleteMany()

    // Look up existing modules and domains
    const modules = await tx.trainingModule.findMany({ orderBy: { number: 'asc' } })
    const moduleById = new Map(modules.map((m) => [m.number, m.id]))
    const domains = await tx.examDomain.findMany()
    const domainById = new Map(domains.map((d) => [d.romanNumeral, d.id]))

    // Step 3: recreate junctions
    for (const j of junctions) {
      const moduleId = moduleById.get(j.moduleName)
      const domainId = domainById.get(j.domainNum)
      if (moduleId === undefined || domainId === undefined) {
        throw new Error(`Missing module ${j.moduleName} or domain ${j.domainNum} for junction`)
      }
      await tx.examDomainToModule.create({
        data: { trainingModuleId: moduleId, examDomainId: domainId },
      })
    }

    // Step 2 & 4: create competencies and PIs
    const competencyIds: Record<string, number> = {}
    let piCount = 0
    for (const c of competencies) {
      const moduleId = moduleById.get(c.moduleName)
      const domainId = domainById.get(c.domainNum)
      if (moduleId === undefined || domainId === undefined) {
        throw new Error(`Missing module ${c.moduleName} or domain ${c.domainNum} for competency ${c.code}`)
      }
      const created = await tx.competency.create({
        data: {
          code: c.code,
          title: c.title,
          description: c.description,
          trainingModuleId: moduleId,
          examDomainId: domainId,
        },
      })
      competencyIds[c.code] = created.id
      for (let i = 0; i < c.pis.length; i++) {
        await tx.performanceIndicator.create({
          data: {
            code: `${c.code}.${i + 1}`,
            description: c.pis[i],
            competencyId: created.id,
          },
        })
        piCount++
      }
    }

    // Step 5: summary
    console.log('--- BOK Seed Complete ---')
    console.log(`Competencies created: ${Object.keys(competencyIds).length}`)
    console.log(`Performance indicators created: ${piCount}`)
    console.log(`Junction records created: ${junctions.length}`)
    console.log('')
    console.log('PI count per competency:')
    for (const c of competencies) {
      console.log(`  ${c.code}: ${c.pis.length}`)
    }
    console.log(`Total PIs: ${piCount}`)
  })

  console.log('Done.')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
