/**
 * EcoSphere seed - a believable mid-size manufacturing org.
 *
 * The goal: every screen looks alive in a demo. We create departments, a mix of
 * roles, emission factors, ~40 operation records with derived carbon
 * transactions (one seeded anomaly), environmental goals tuned so scores vary,
 * a full challenge lifecycle, badges/rewards, and seeded Social + Governance
 * records. One demo persona is left one approval away from unlocking a badge.
 */
import { PrismaClient } from "@prisma/client";
import { parseRule, satisfiesRule } from "../lib/badges";

const prisma = new PrismaClient();

// Deterministic pseudo-random so the demo is reproducible run to run.
let seedState = 1337;
function rand() {
  seedState = (seedState * 1103515245 + 12345) & 0x7fffffff;
  return seedState / 0x7fffffff;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
function between(min: number, max: number) {
  return min + rand() * (max - min);
}
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log("Resetting database...");
  // Delete in FK-safe order.
  await prisma.employeeParticipation.deleteMany();
  await prisma.policyAcknowledgement.deleteMany();
  await prisma.rewardRedemption.deleteMany();
  await prisma.employeeBadge.deleteMany();
  await prisma.challengeParticipation.deleteMany();
  await prisma.carbonTransaction.deleteMany();
  await prisma.operationRecord.deleteMany();
  await prisma.departmentScore.deleteMany();
  await prisma.environmentalGoal.deleteMany();
  await prisma.audit.deleteMany();
  await prisma.complianceIssue.deleteMany();
  await prisma.cSRActivity.deleteMany();
  await prisma.eSGPolicy.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.category.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.emissionFactor.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();
  await prisma.esgConfig.deleteMany();

  // ---------------------------------------------------------------
  // Config (single row)
  // ---------------------------------------------------------------
  await prisma.esgConfig.create({
    data: {
      id: "singleton",
      weightEnvironmental: 0.4,
      weightSocial: 0.3,
      weightGovernance: 0.3,
      autoEmissionEnabled: true,
      evidenceRequiredEnabled: true,
      badgeAutoAwardEnabled: true,
    },
  });

  // ---------------------------------------------------------------
  // Departments
  // ---------------------------------------------------------------
  console.log("Seeding departments...");
  const deptData = [
    { name: "Manufacturing", code: "MFG", employeeCount: 5, seedSocialScore: 68, seedGovScore: 74 },
    { name: "Logistics & Fleet", code: "LOG", employeeCount: 3, seedSocialScore: 61, seedGovScore: 66 },
    { name: "Operations", code: "OPS", employeeCount: 3, seedSocialScore: 79, seedGovScore: 82 },
    { name: "Corporate & HR", code: "CORP", employeeCount: 2, seedSocialScore: 88, seedGovScore: 90 },
    { name: "R&D Innovation", code: "RND", employeeCount: 2, seedSocialScore: 84, seedGovScore: 77 },
  ];
  const departments = [];
  for (const d of deptData) {
    departments.push(await prisma.department.create({ data: d }));
  }
  const deptByCode = Object.fromEntries(departments.map((d) => [d.code, d]));

  // ---------------------------------------------------------------
  // Employees (1 Admin, a few Managers, rest Employees)
  // ---------------------------------------------------------------
  console.log("Seeding employees...");
  // Vibrant, gamified identity colors (dark initials read on all of them).
  const colors = ["#FFE600", "#FF5C4A", "#22D3EE", "#A855F7", "#34D399", "#F472B6", "#FB923C", "#60A5FA"];
  const employeeData = [
    { name: "Priya Menon", email: "priya.menon@ecosphere.io", role: "Admin", code: "CORP", title: "Chief Sustainability Officer", xp: 2100, points: 1400 },
    { name: "Rahul Verma", email: "rahul.verma@ecosphere.io", role: "Manager", code: "MFG", title: "Plant Manager", xp: 1650, points: 900 },
    { name: "Anjali Nair", email: "anjali.nair@ecosphere.io", role: "Manager", code: "LOG", title: "Logistics Lead", xp: 1180, points: 640 },
    { name: "Karan Patel", email: "karan.patel@ecosphere.io", role: "Manager", code: "OPS", title: "Operations Manager", xp: 1420, points: 820 },
    // The demo persona: one approval away from the 500-XP "Rising Star" badge.
    { name: "Aarav Sharma", email: "aarav.sharma@ecosphere.io", role: "Employee", code: "MFG", title: "Process Engineer", xp: 480, points: 320 },
    { name: "Sneha Reddy", email: "sneha.reddy@ecosphere.io", role: "Employee", code: "MFG", title: "Quality Analyst", xp: 720, points: 410 },
    { name: "Vikram Singh", email: "vikram.singh@ecosphere.io", role: "Employee", code: "MFG", title: "Line Supervisor", xp: 1520, points: 260 },
    { name: "Meera Iyer", email: "meera.iyer@ecosphere.io", role: "Employee", code: "LOG", title: "Fleet Coordinator", xp: 340, points: 180 },
    { name: "Dev Malhotra", email: "dev.malhotra@ecosphere.io", role: "Employee", code: "LOG", title: "Route Planner", xp: 910, points: 550 },
    { name: "Tara Bose", email: "tara.bose@ecosphere.io", role: "Employee", code: "OPS", title: "Facilities Officer", xp: 610, points: 300 },
    { name: "Rohan Gupta", email: "rohan.gupta@ecosphere.io", role: "Employee", code: "OPS", title: "Energy Analyst", xp: 1340, points: 720 },
    { name: "Isha Kapoor", email: "isha.kapoor@ecosphere.io", role: "Employee", code: "CORP", title: "People Partner", xp: 260, points: 140 },
    { name: "Nikhil Rao", email: "nikhil.rao@ecosphere.io", role: "Employee", code: "RND", title: "Research Scientist", xp: 1780, points: 980 },
    { name: "Zoya Khan", email: "zoya.khan@ecosphere.io", role: "Employee", code: "RND", title: "Materials Engineer", xp: 520, points: 350 },
    { name: "Arjun Desai", email: "arjun.desai@ecosphere.io", role: "Employee", code: "OPS", title: "Sustainability Intern", xp: 90, points: 60 },
  ];
  const employees = [];
  for (let i = 0; i < employeeData.length; i++) {
    const e = employeeData[i];
    employees.push(
      await prisma.employee.create({
        data: {
          name: e.name,
          email: e.email,
          role: e.role,
          title: e.title,
          xp: e.xp,
          points: e.points,
          avatarColor: colors[i % colors.length],
          departmentId: deptByCode[e.code].id,
        },
      }),
    );
  }
  const empByEmail = Object.fromEntries(employees.map((e) => [e.email, e]));

  // ---------------------------------------------------------------
  // Emission factors (one+ per source type)
  // ---------------------------------------------------------------
  console.log("Seeding emission factors...");
  const factorData = [
    { name: "Grid Electricity", unit: "kg CO2 / kWh", factor: 0.71, sourceType: "Purchase" },
    { name: "Purchased Steel", unit: "kg CO2 / kg", factor: 1.85, sourceType: "Purchase" },
    { name: "Injection Moulding", unit: "kg CO2 / unit", factor: 2.4, sourceType: "Manufacturing" },
    { name: "Metal Casting", unit: "kg CO2 / unit", factor: 3.1, sourceType: "Manufacturing" },
    { name: "Business Travel (Air)", unit: "kg CO2 / km", factor: 0.18, sourceType: "Expense" },
    { name: "Office Supplies Spend", unit: "kg CO2 / $", factor: 0.42, sourceType: "Expense" },
    { name: "Diesel Fleet", unit: "kg CO2 / L", factor: 2.68, sourceType: "Fleet" },
    { name: "Delivery Van (Petrol)", unit: "kg CO2 / L", factor: 2.31, sourceType: "Fleet" },
  ];
  const factors = [];
  for (const f of factorData) {
    factors.push(await prisma.emissionFactor.create({ data: f }));
  }
  const factorsByType = (t: string) => factors.filter((f) => f.sourceType === t);

  // ---------------------------------------------------------------
  // Operation records + derived carbon transactions
  // ---------------------------------------------------------------
  console.log("Seeding operations and carbon ledger...");
  const opTypes = ["Purchase", "Manufacturing", "Expense", "Fleet"] as const;
  // Department emphasis so emissions cluster believably.
  const deptTypeBias: Record<string, (typeof opTypes)[number][]> = {
    MFG: ["Manufacturing", "Manufacturing", "Purchase", "Expense"],
    LOG: ["Fleet", "Fleet", "Fleet", "Expense"],
    OPS: ["Purchase", "Expense", "Purchase", "Fleet"],
    CORP: ["Expense", "Expense", "Purchase", "Expense"],
    RND: ["Manufacturing", "Expense", "Purchase", "Expense"],
  };
  const qtyRange: Record<(typeof opTypes)[number], [number, number]> = {
    Purchase: [200, 1200],
    Manufacturing: [150, 900],
    Expense: [300, 2500],
    Fleet: [80, 600],
  };
  const descByType: Record<string, string[]> = {
    Purchase: ["Grid electricity draw", "Raw steel procurement", "Packaging materials", "Monthly power bill"],
    Manufacturing: ["Production batch", "Moulding run", "Casting shift output", "Assembly line run"],
    Expense: ["Business travel", "Office supplies", "Vendor services", "Facilities spend"],
    Fleet: ["Delivery route fuel", "Fleet refuel", "Inter-site transport", "Last-mile delivery"],
  };

  let opCount = 0;
  let anomalySeeded = false;
  for (const dept of departments) {
    const bias = deptTypeBias[dept.code];
    const nRecords = 8; // 5 depts x 8 = 40 operation records
    for (let i = 0; i < nRecords; i++) {
      const type = pick(bias);
      const [lo, hi] = qtyRange[type];
      let quantity = Math.round(between(lo, hi));
      const date = daysAgo(Math.floor(between(2, 170)));

      const op = await prisma.operationRecord.create({
        data: {
          type,
          departmentId: dept.id,
          quantity,
          date,
          description: pick(descByType[type]),
        },
      });
      opCount++;

      // Auto carbon calc: quantity * matching factor.
      const factor = pick(factorsByType(type));
      let computedCO2 = quantity * factor.factor;

      // Seed exactly one glaring anomaly in Manufacturing for the demo.
      let anomaly = false;
      let anomalyReason: string | null = null;
      if (!anomalySeeded && dept.code === "MFG" && type === "Manufacturing" && i === 3) {
        quantity = 4200;
        computedCO2 = quantity * factor.factor;
        anomaly = true;
        anomalyReason = "Quantity 6.4x the department mean for this source type";
        anomalySeeded = true;
        await prisma.operationRecord.update({
          where: { id: op.id },
          data: { quantity, description: "Unplanned overtime casting surge" },
        });
      }

      await prisma.carbonTransaction.create({
        data: {
          operationRecordId: op.id,
          emissionFactorId: factor.id,
          departmentId: dept.id,
          quantity,
          computedCO2: Math.round(computedCO2 * 10) / 10,
          date,
          auto: true,
          anomaly,
          anomalyReason,
        },
      });
    }
  }
  console.log(`  ${opCount} operation records + carbon transactions`);

  // ---------------------------------------------------------------
  // Environmental goals (tuned so scores span the grade bands)
  // ---------------------------------------------------------------
  console.log("Seeding environmental goals...");
  // Compute actual CO2 per department to set believable targets.
  const co2ByDept: Record<string, number> = {};
  for (const dept of departments) {
    const agg = await prisma.carbonTransaction.aggregate({
      where: { departmentId: dept.id },
      _sum: { computedCO2: true },
    });
    co2ByDept[dept.id] = agg._sum.computedCO2 ?? 0;
  }
  // Multipliers: >1 means goal target above actual (good score), <1 below (poor).
  const goalMultiplier: Record<string, number> = {
    MFG: 0.82, // over budget -> lower score
    LOG: 0.9,
    OPS: 1.15, // under budget -> strong score
    CORP: 1.35,
    RND: 1.05,
  };
  for (const dept of departments) {
    const target = Math.round((co2ByDept[dept.id] * goalMultiplier[dept.code]) / 10) * 10;
    await prisma.environmentalGoal.create({
      data: {
        name: `FY26 carbon cap - ${dept.name}`,
        departmentId: dept.id,
        metric: "Total CO2 (kg)",
        targetValue: target,
        period: "2026",
        status: "Active",
      },
    });
  }

  // ---------------------------------------------------------------
  // Categories
  // ---------------------------------------------------------------
  const catChallenge = await prisma.category.create({ data: { name: "Sustainability Challenge", type: "Challenge" } });
  const catEnergy = await prisma.category.create({ data: { name: "Energy Saving", type: "Challenge" } });
  const catCSR = await prisma.category.create({ data: { name: "Community CSR", type: "CSR" } });

  // ---------------------------------------------------------------
  // Challenges (full lifecycle)
  // ---------------------------------------------------------------
  console.log("Seeding challenges...");
  const challengeData = [
    { title: "Switch off idle machines", description: "Power down equipment during breaks for one week and log savings.", xp: 150, difficulty: "Easy", status: "Under Review", evidenceRequired: true, categoryId: catEnergy.id, deadline: daysAgo(-5) },
    { title: "Zero single-use plastics week", description: "Eliminate single-use plastics from your workspace for 7 days.", xp: 200, difficulty: "Medium", status: "Active", evidenceRequired: true, categoryId: catChallenge.id, deadline: daysAgo(-12) },
    { title: "Carpool to site", description: "Share a ride to work at least 3 times this month.", xp: 120, difficulty: "Easy", status: "Active", evidenceRequired: false, categoryId: catChallenge.id, deadline: daysAgo(-20) },
    { title: "Optimize a delivery route", description: "Cut fuel on one route by re-planning stops. Submit before/after.", xp: 300, difficulty: "Hard", status: "Active", evidenceRequired: true, categoryId: catEnergy.id, deadline: daysAgo(-18) },
    { title: "Recycle e-waste drive", description: "Collect and properly dispose of office e-waste.", xp: 180, difficulty: "Medium", status: "Completed", evidenceRequired: true, categoryId: catChallenge.id, deadline: daysAgo(30) },
    { title: "Plant 10 trees", description: "Organize a tree-planting with your team.", xp: 250, difficulty: "Medium", status: "Completed", evidenceRequired: true, categoryId: catCSR.id, deadline: daysAgo(45) },
    { title: "Paperless month", description: "Go fully digital for reports and approvals.", xp: 160, difficulty: "Easy", status: "Draft", evidenceRequired: false, categoryId: catEnergy.id, deadline: daysAgo(-40) },
    { title: "Legacy: LED retrofit", description: "Retrofit office lighting to LED (archived pilot).", xp: 220, difficulty: "Hard", status: "Archived", evidenceRequired: true, categoryId: catEnergy.id, deadline: daysAgo(90) },
  ];
  const challenges = [];
  for (const c of challengeData) {
    challenges.push(await prisma.challenge.create({ data: c }));
  }
  const challengeByTitle = Object.fromEntries(challenges.map((c) => [c.title, c]));

  // ---------------------------------------------------------------
  // Challenge participations
  // ---------------------------------------------------------------
  console.log("Seeding participations...");
  const participationData = [
    // The demo's live-approval target: Aarav pending on a 150-XP challenge.
    { challenge: "Switch off idle machines", email: "aarav.sharma@ecosphere.io", progress: 100, approval: "Pending", proof: "Logged 6 machine-hours saved with photos of the shutdown checklist.", xpAwarded: 0 },
    { challenge: "Switch off idle machines", email: "sneha.reddy@ecosphere.io", progress: 100, approval: "Pending", proof: "Attached weekly meter readings.", xpAwarded: 0 },
    { challenge: "Zero single-use plastics week", email: "sneha.reddy@ecosphere.io", progress: 60, approval: "Pending", proof: null, xpAwarded: 0 },
    { challenge: "Carpool to site", email: "meera.iyer@ecosphere.io", progress: 45, approval: "Pending", proof: null, xpAwarded: 0 },
    { challenge: "Optimize a delivery route", email: "dev.malhotra@ecosphere.io", progress: 80, approval: "Pending", proof: "Route B shortened by 14km/day.", xpAwarded: 0 },
    // Historical approved (drive completed counts + XP already granted).
    { challenge: "Recycle e-waste drive", email: "vikram.singh@ecosphere.io", progress: 100, approval: "Approved", proof: "Collected 34kg e-waste.", xpAwarded: 180 },
    { challenge: "Recycle e-waste drive", email: "nikhil.rao@ecosphere.io", progress: 100, approval: "Approved", proof: "Certified disposal receipt.", xpAwarded: 180 },
    { challenge: "Plant 10 trees", email: "nikhil.rao@ecosphere.io", progress: 100, approval: "Approved", proof: "Team photo, 12 saplings.", xpAwarded: 250 },
    { challenge: "Plant 10 trees", email: "rohan.gupta@ecosphere.io", progress: 100, approval: "Approved", proof: "Native species planted.", xpAwarded: 250 },
    { challenge: "Plant 10 trees", email: "sneha.reddy@ecosphere.io", progress: 100, approval: "Approved", proof: "Weekend drive.", xpAwarded: 250 },
    { challenge: "Recycle e-waste drive", email: "dev.malhotra@ecosphere.io", progress: 100, approval: "Approved", proof: "Logged bins.", xpAwarded: 180 },
    // A rejection for realism.
    { challenge: "Zero single-use plastics week", email: "arjun.desai@ecosphere.io", progress: 30, approval: "Rejected", proof: "Insufficient evidence.", xpAwarded: 0 },
  ];
  for (const p of participationData) {
    await prisma.challengeParticipation.create({
      data: {
        challengeId: challengeByTitle[p.challenge].id,
        employeeId: empByEmail[p.email].id,
        progress: p.progress,
        approval: p.approval,
        proof: p.proof,
        xpAwarded: p.xpAwarded,
      },
    });
  }

  // ---------------------------------------------------------------
  // Badges
  // ---------------------------------------------------------------
  console.log("Seeding badges + auto-award...");
  const badgeData = [
    { name: "First Steps", description: "Earn your first 100 XP.", unlockRule: JSON.stringify({ type: "xp", gte: 100 }), icon: "Footprints", tier: "Bronze" },
    { name: "Green Rookie", description: "Reach 300 XP on your sustainability journey.", unlockRule: JSON.stringify({ type: "xp", gte: 300 }), icon: "Sprout", tier: "Bronze" },
    { name: "Rising Star", description: "Break 500 XP.", unlockRule: JSON.stringify({ type: "xp", gte: 500 }), icon: "Star", tier: "Silver" },
    { name: "Eco Champion", description: "Amass 1,500 XP.", unlockRule: JSON.stringify({ type: "xp", gte: 1500 }), icon: "Trophy", tier: "Gold" },
    { name: "Serial Challenger", description: "Complete 3 challenges.", unlockRule: JSON.stringify({ type: "challenges_completed", gte: 3 }), icon: "Swords", tier: "Silver" },
    { name: "Sustainability Legend", description: "Complete 5 challenges.", unlockRule: JSON.stringify({ type: "challenges_completed", gte: 5 }), icon: "Crown", tier: "Platinum" },
  ];
  const badges = [];
  for (const b of badgeData) {
    badges.push(await prisma.badge.create({ data: b }));
  }

  // Auto-award based on current XP/points and approved-challenge counts.
  for (const emp of employees) {
    const completed = await prisma.challengeParticipation.count({
      where: { employeeId: emp.id, approval: "Approved" },
    });
    for (const badge of badges) {
      const rule = parseRule(badge.unlockRule);
      if (!rule) continue;
      if (satisfiesRule(rule, { xp: emp.xp, points: emp.points, challengesCompleted: completed })) {
        await prisma.employeeBadge.create({
          data: { employeeId: emp.id, badgeId: badge.id, awardedAt: daysAgo(Math.floor(between(1, 60))) },
        });
      }
    }
  }

  // ---------------------------------------------------------------
  // Rewards + historical redemptions
  // ---------------------------------------------------------------
  console.log("Seeding rewards...");
  const rewardData = [
    { name: "Reusable Coffee Cup", description: "Branded stainless steel cup.", pointsRequired: 150, stock: 40, icon: "Coffee" },
    { name: "Eco Tote Bag", description: "Organic cotton tote.", pointsRequired: 200, stock: 25, icon: "ShoppingBag" },
    { name: "Plant-a-Tree in Your Name", description: "We plant a tree with a certificate.", pointsRequired: 500, stock: 100, icon: "TreePine" },
    { name: "Company Hoodie", description: "Recycled-fabric hoodie.", pointsRequired: 800, stock: 12, icon: "Shirt" },
    { name: "Extra Day Off", description: "One additional paid leave day.", pointsRequired: 2000, stock: 5, icon: "Palmtree" },
    { name: "Lunch with the CSO", description: "A working lunch with sustainability leadership.", pointsRequired: 1200, stock: 3, icon: "Utensils" },
  ];
  const rewards = [];
  for (const r of rewardData) {
    rewards.push(await prisma.reward.create({ data: r }));
  }
  // A couple of past redemptions (do not double-charge points here; these are history).
  await prisma.rewardRedemption.create({ data: { rewardId: rewards[0].id, employeeId: empByEmail["rohan.gupta@ecosphere.io"].id, pointsSpent: 150, date: daysAgo(22) } });
  await prisma.rewardRedemption.create({ data: { rewardId: rewards[2].id, employeeId: empByEmail["nikhil.rao@ecosphere.io"].id, pointsSpent: 500, date: daysAgo(9) } });

  // ---------------------------------------------------------------
  // Social (seed-only)
  // ---------------------------------------------------------------
  console.log("Seeding social + governance...");
  const csrData = [
    { title: "Coastal cleanup drive", category: "Environment", impact: "820 kg waste removed", departmentId: deptByCode.OPS.id, status: "Completed", date: daysAgo(28) },
    { title: "Local school STEM workshop", category: "Education", impact: "120 students reached", departmentId: deptByCode.RND.id, status: "Completed", date: daysAgo(40) },
    { title: "Blood donation camp", category: "Health", impact: "76 units collected", departmentId: deptByCode.CORP.id, status: "Completed", date: daysAgo(15) },
    { title: "Food bank volunteering", category: "Community", impact: "2,400 meals packed", departmentId: deptByCode.LOG.id, status: "Completed", date: daysAgo(52) },
    { title: "Women in Engineering mentorship", category: "Diversity", impact: "18 mentees onboarded", departmentId: deptByCode.MFG.id, status: "Ongoing", date: daysAgo(6) },
  ];
  const csrActivities = [];
  for (const c of csrData) {
    csrActivities.push(await prisma.cSRActivity.create({ data: c }));
  }
  // Spread participation across employees.
  for (const csr of csrActivities) {
    const n = Math.floor(between(3, 7));
    const shuffled = [...employees].sort(() => rand() - 0.5).slice(0, n);
    for (const emp of shuffled) {
      await prisma.employeeParticipation.create({
        data: { csrActivityId: csr.id, employeeId: emp.id, hours: Math.round(between(2, 10)) },
      });
    }
  }

  // ---------------------------------------------------------------
  // Governance (seed-only)
  // ---------------------------------------------------------------
  const policyData = [
    { title: "Code of Business Conduct", body: "All employees must act with integrity, avoid conflicts of interest, and report misconduct.", category: "Ethics", status: "Published" },
    { title: "Environmental Compliance Policy", body: "Operations must meet or exceed local emission and waste regulations, reviewed quarterly.", category: "Environmental", status: "Published" },
    { title: "Data Privacy & Protection", body: "Personal data is processed lawfully, minimized, and secured per applicable regulation.", category: "Governance", status: "Published" },
    { title: "Supplier ESG Standards", body: "Suppliers must meet baseline labor, safety, and environmental criteria to be onboarded.", category: "Supply Chain", status: "Published" },
    { title: "Whistleblower Protection", body: "Good-faith reporters are protected from retaliation; reports are handled confidentially.", category: "Ethics", status: "Draft" },
  ];
  const policies = [];
  for (const p of policyData) {
    policies.push(await prisma.eSGPolicy.create({ data: p }));
  }
  // Acknowledgements for realism.
  for (const policy of policies.filter((p) => p.status === "Published")) {
    const n = Math.floor(between(6, 12));
    const shuffled = [...employees].sort(() => rand() - 0.5).slice(0, n);
    for (const emp of shuffled) {
      await prisma.policyAcknowledgement.create({
        data: { policyId: policy.id, employeeId: emp.id, ackedAt: daysAgo(Math.floor(between(1, 50))) },
      });
    }
  }

  const auditData = [
    { title: "ISO 14001 surveillance audit", type: "External", result: "Pass", departmentId: deptByCode.MFG.id, notes: "Minor observation on chemical storage labelling.", date: daysAgo(34) },
    { title: "Internal safety audit", type: "Internal", result: "Partial", departmentId: deptByCode.LOG.id, notes: "2 of 3 corrective actions closed.", date: daysAgo(19) },
    { title: "Financial controls review", type: "External", result: "Pass", departmentId: deptByCode.CORP.id, notes: "No material findings.", date: daysAgo(60) },
    { title: "Waste handling audit", type: "Internal", result: "Fail", departmentId: deptByCode.MFG.id, notes: "Segregation lapses; remediation plan issued.", date: daysAgo(8) },
  ];
  for (const a of auditData) await prisma.audit.create({ data: a });

  const issueData = [
    { title: "Overdue hazardous waste manifest", severity: "High", status: "In Progress", departmentId: deptByCode.MFG.id },
    { title: "Missing supplier ESG attestation", severity: "Medium", status: "Open", departmentId: deptByCode.LOG.id },
    { title: "Expired fire safety certificate", severity: "Critical", status: "Open", departmentId: deptByCode.OPS.id },
    { title: "Incomplete data-processing register", severity: "Low", status: "Resolved", departmentId: deptByCode.CORP.id },
    { title: "Delayed emission report filing", severity: "Medium", status: "In Progress", departmentId: deptByCode.RND.id },
  ];
  for (const i of issueData) await prisma.complianceIssue.create({ data: { ...i, raisedAt: daysAgo(Math.floor(between(3, 40))) } });

  console.log("\nSeed complete.");
  console.log(`  ${departments.length} departments, ${employees.length} employees`);
  console.log(`  ${factors.length} emission factors, ${opCount} operations`);
  console.log(`  ${challenges.length} challenges, ${badges.length} badges, ${rewards.length} rewards`);
  console.log(`  Demo persona: Aarav Sharma (480 XP) has a pending approval that unlocks 'Rising Star'.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
