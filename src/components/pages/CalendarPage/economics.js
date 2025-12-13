// src/components/pages/CalendarPage/economics.js

// Цей модуль реалізує економічні обрахунки, описані у розділі 2.5 записки:
// - витрати на виконання операцій (власні / найм)
// - виручку (через урожайність за погодними сценаріями)
// - прибуток за сценарієм, очікуваний прибуток та ризик (варіація)

const round2 = (x) => Math.round((Number(x) || 0) * 100) / 100;

export function formatUAH(x) {
  const n = Number(x) || 0;
  return n.toLocaleString("uk-UA", {
    maximumFractionDigits: 0,
  });
}

export function formatTons(x) {
  const n = Number(x) || 0;
  return n.toLocaleString("uk-UA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatPct(x) {
  const n = Number(x) || 0;
  return (n * 100).toLocaleString("uk-UA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
}

function byId(list, id) {
  return (list || []).find((x) => String(x.id) === String(id)) || null;
}

function getAreaHa(fields, fieldId) {
  const f = byId(fields, fieldId);
  return Number(f?.areaHa) || 0;
}

function getCrop(crops, cropId) {
  return byId(crops, cropId);
}

function getYieldFactorForScenario(scenario, cropId) {
  const impacts = scenario?.cropImpacts || [];
  const hit = impacts.find((x) => String(x.cropId) === String(cropId));
  return Number(hit?.yieldFactor) || 1;
}

function getOpCost(operationCosts, cropId, operationId) {
  const arr = operationCosts || [];
  return (
    arr.find(
      (x) =>
        String(x.cropId) === String(cropId) &&
        String(x.operationId) === String(operationId)
    ) || null
  );
}

function isCanceled(e) {
  return String(e?.status || "") === "canceled";
}

function isOperation(e) {
  return String(e?.type || "") === "operation";
}

function isHarvest(e) {
  // У демо-конфігу "o_harv" — збирання.
  // У реальній системі краще позначати операції типом/тегом.
  return String(e?.operationId || "") === "o_harv";
}

function executionKind(e) {
  // Спрощення: якщо призначена власна техніка — вважаємо "own".
  // Якщо техніка не задана — трактуємо як "hire".
  return e?.machineId ? "own" : "hire";
}

export function computeEconomics({
  events,
  fields,
  crops,
  weatherScenarios,
  operationCosts,
}) {
  const ops = (events || []).filter((e) => isOperation(e) && !isCanceled(e));

  // 1) Витрати (2.5.1)
  let totalCosts = 0;
  const missingCostRows = [];

  for (const e of ops) {
    const areaHa = getAreaHa(fields, e.fieldId);
    if (!areaHa) continue;
    if (!e.cropId || !e.operationId) continue;

    const costRow = getOpCost(operationCosts, e.cropId, e.operationId);
    if (!costRow) {
      missingCostRows.push({ cropId: e.cropId, operationId: e.operationId });
      continue;
    }

    const kind = executionKind(e);
    const perHa = kind === "hire" ? costRow.costHire : costRow.costOwn;
    totalCosts += (Number(perHa) || 0) * areaHa;
  }

  totalCosts = round2(totalCosts);

  // 2) Виробництво/виручка за сценаріями (2.5.2)
  const scenarios = (weatherScenarios || []).filter(
    (s) => (Number(s?.probability) || 0) > 0
  );

  const scenarioResults = scenarios.map((s) => {
    let tons = 0;
    let revenue = 0;

    for (const e of ops) {
      if (!isHarvest(e)) continue;
      const areaHa = getAreaHa(fields, e.fieldId);
      if (!areaHa) continue;
      const crop = getCrop(crops, e.cropId);
      if (!crop) continue;

      const baseYield = Number(crop.baseYield) || 0; // Y0
      const price = Number(crop.pricePerTon) || 0; // Pc
      const wFactor = getYieldFactorForScenario(s, e.cropId); // α_{c,s}

      // Спрощення: K_predecessor = 1, K_ops = 1, добрива/ЗЗР = 1.
      // Ці множники легко під’єднаються, коли ти додаси в дані
      // рекомендовані строки/штрафи/внесення добрив у подіях.
      const yieldTPerHa = baseYield * wFactor;

      const t = areaHa * yieldTPerHa;
      tons += t;
      revenue += t * price;
    }

    const profit = revenue - totalCosts; // 2.5.3

    return {
      scenarioId: s.id,
      scenarioName: s.name,
      probability: Number(s.probability) || 0,
      tons: round2(tons),
      revenue: round2(revenue),
      profit: round2(profit),
      costPerTon: tons > 0 ? round2(totalCosts / tons) : 0,
      rentSales: revenue > 0 ? round2(profit / revenue) : 0,
      rentCosts: totalCosts > 0 ? round2(profit / totalCosts) : 0,
    };
  });

  // 3) Очікувані значення та ризик (2.5.4–2.5.5)
  let expectedRevenue = 0;
  let expectedProfit = 0;
  for (const r of scenarioResults) {
    expectedRevenue += r.probability * r.revenue;
    expectedProfit += r.probability * r.profit;
  }
  expectedRevenue = round2(expectedRevenue);
  expectedProfit = round2(expectedProfit);

  let varianceProfit = 0;
  for (const r of scenarioResults) {
    varianceProfit += r.probability * Math.pow(r.profit - expectedProfit, 2);
  }
  varianceProfit = round2(varianceProfit);
  const stdProfit = round2(Math.sqrt(varianceProfit));

  return {
    totalCosts,
    expectedRevenue,
    expectedProfit,
    varianceProfit,
    stdProfit,
    scenarioResults,
    missingCostRows,
  };
}
