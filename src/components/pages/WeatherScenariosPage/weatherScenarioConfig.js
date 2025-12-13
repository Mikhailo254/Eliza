// src/components/pages/WeatherScenariosPage/weatherScenarioConfig.js

// Тимчасово підтягуємо довідник культур з MachinesPage,
// щоб не дублювати його повторно
import { CROPS } from "../MachinesPage/machineConfig";

// Типи сценаріїв, з якими працює програма (фіксований набір)
export const YEAR_TYPES = [
  { id: "normal", label: "Нормальний рік" },
  { id: "dry", label: "Посушливий рік" },
  { id: "very_dry", label: "Дуже сухий рік" },
  { id: "wet", label: "Вологий рік" },
  { id: "very_wet", label: "Дуже вологий рік" },
];

// Базовий «порожній» сценарій (використовується як шаблон)
export const createEmptyScenario = () => ({
  id: null,
  code: "",
  name: "",
  isBaseline: false,
  probability: 0.2,

  yearType: "normal",
  descriptionShort: "",
  description: "",

  meteo: {
    precip_spring: "",
    precip_summer: "",
    precip_autumn: "",
    temp_spring: "",
    temp_summer: "",
    workDays_spring: "",
    workDays_summer: "",
    sprayWindows_summer: "",
  },

  operationImpact: {
    soilPrepFactor: 1.0,
    sowingFactor: 1.0,
    sprayingFactor: 1.0,
    harvestFactor: 1.0,
  },

  cropImpacts: CROPS.map((crop) => ({
    cropId: crop.id,
    yieldFactor: 1.0,
    note: "",
  })),

  notes: "",
});

// Допоміжна функція — визначити шаблон γ та примітки залежно від сценарію і культури
function buildCropImpactTemplate(yearType, crop) {
  const label = (crop.label || "").toLowerCase();

  // для простоти орієнтуємось по назві культури
  const isSoy = label.includes("соя") || label.includes("soy");
  const isCorn = label.includes("кукуруд") || label.includes("corn");
  const isWheat = label.includes("пшениц") || label.includes("wheat");
  const isBarley = label.includes("ячмін") || label.includes("barley");
  const isSunflower =
    label.includes("соняш") ||
    label.includes("sunflower") ||
    label.includes("соняшник");

  switch (yearType) {
    case "normal":
      return {
        yieldFactor: 1.0,
        note: "Умови близькі до кліматичної норми для регіону.",
      };

    case "dry": {
      let factor = 0.9;
      let note = "Помірна посуха, незначне зниження врожайності.";

      if (isSoy || isCorn || isSunflower) {
        factor = 0.8;
        note = "Посушливий рік: культура помірно страждає від нестачі вологи.";
      }

      return { yieldFactor: factor, note };
    }

    case "very_dry": {
      let factor = 0.8;
      let note = "Сильна посуха, суттєве зниження врожайності.";

      if (isSoy || isCorn || isSunflower) {
        factor = 0.6;
        note = "Дуже сухий рік: культура сильно страждає від тривалої посухи.";
      }

      if (isWheat || isBarley) {
        factor = 0.75;
        note =
          "Дуже сухий рік: зниження врожайності, частина площ може недобрати врожай.";
      }

      return { yieldFactor: factor, note };
    }

    case "wet": {
      let factor = 1.0;
      let note =
        "Підвищена вологість: можливі як позитивні, так і негативні ефекти.";

      if (isWheat || isBarley) {
        factor = 1.05;
        note =
          "Вологий рік: за відсутності перезволоження може трохи підвищувати врожайність.";
      }

      if (isSoy || isSunflower) {
        factor = 0.95;
        note =
          "Вологий рік: ризики хвороб і ускладнення захисту можуть трохи знизити врожайність.";
      }

      return { yieldFactor: factor, note };
    }

    case "very_wet": {
      let factor = 0.9;
      let note = "Дуже вологий рік: підвищений ризик перезволоження та хвороб.";

      if (isWheat || isBarley) {
        factor = 0.85;
        note =
          "Дуже вологий рік: ускладнене збирання, можливе проростання зерна, втрати врожаю.";
      }

      if (isSoy || isSunflower || isCorn) {
        factor = 0.8;
        note =
          "Дуже вологий рік: можливі проблеми зі збиранням і високий тиск хвороб.";
      }

      return { yieldFactor: factor, note };
    }

    default:
      return {
        yieldFactor: 1.0,
        note: "",
      };
  }
}

// Шаблони агрегованих метеопараметрів і впливу на операції для кожного типу року
const WEATHER_SCENARIO_TEMPLATES = {
  normal: {
    descriptionShort: "Рік із погодою, близькою до кліматичної норми.",
    meteo: {
      precip_spring: 120,
      precip_summer: 180,
      precip_autumn: 140,
      temp_spring: 9,
      temp_summer: 20,
      workDays_spring: 22,
      workDays_summer: 18,
      sprayWindows_summer: 7,
    },
    operationImpact: {
      soilPrepFactor: 1.0,
      sowingFactor: 1.0,
      sprayingFactor: 1.0,
      harvestFactor: 1.0,
    },
  },

  dry: {
    descriptionShort: "Посушливий рік з дефіцитом опадів у ключові періоди.",
    meteo: {
      precip_spring: 80,
      precip_summer: 120,
      precip_autumn: 130,
      temp_spring: 11,
      temp_summer: 23,
      workDays_spring: 24,
      workDays_summer: 20,
      sprayWindows_summer: 9,
    },
    operationImpact: {
      soilPrepFactor: 0.95,
      sowingFactor: 0.9,
      sprayingFactor: 1.1,
      harvestFactor: 1.0,
    },
  },

  very_dry: {
    descriptionShort: "Дуже сухий рік з тривалими періодами посухи.",
    meteo: {
      precip_spring: 60,
      precip_summer: 90,
      precip_autumn: 110,
      temp_spring: 12,
      temp_summer: 25,
      workDays_spring: 26,
      workDays_summer: 22,
      sprayWindows_summer: 11,
    },
    operationImpact: {
      soilPrepFactor: 0.9,
      sowingFactor: 0.85,
      sprayingFactor: 1.15,
      harvestFactor: 0.95,
    },
  },

  wet: {
    descriptionShort: "Вологий рік із підвищеними опадами.",
    meteo: {
      precip_spring: 150,
      precip_summer: 220,
      precip_autumn: 170,
      temp_spring: 8,
      temp_summer: 19,
      workDays_spring: 20,
      workDays_summer: 15,
      sprayWindows_summer: 6,
    },
    operationImpact: {
      soilPrepFactor: 0.95,
      sowingFactor: 0.95,
      sprayingFactor: 0.9,
      harvestFactor: 0.9,
    },
  },

  very_wet: {
    descriptionShort: "Дуже вологий рік з ризиком перезволоження ґрунту.",
    meteo: {
      precip_spring: 180,
      precip_summer: 260,
      precip_autumn: 190,
      temp_spring: 7,
      temp_summer: 18,
      workDays_spring: 18,
      workDays_summer: 12,
      sprayWindows_summer: 5,
    },
    operationImpact: {
      soilPrepFactor: 0.9,
      sowingFactor: 0.9,
      sprayingFactor: 0.85,
      harvestFactor: 0.8,
    },
  },
};

// Створення сценарію на основі типу року + додаткових параметрів
export const createScenarioForYearType = (yearType, extra = {}) => {
  const base = createEmptyScenario();
  const tpl = WEATHER_SCENARIO_TEMPLATES[yearType] || {};
  const typeInfo = YEAR_TYPES.find((t) => t.id === yearType);

  return {
    ...base,
    yearType,
    code: extra.code || yearType.toUpperCase(),
    name: extra.name || typeInfo?.label || base.name,
    isBaseline: extra.isBaseline ?? base.isBaseline,
    probability: extra.probability ?? base.probability,
    descriptionShort: tpl.descriptionShort || base.descriptionShort,
    description: tpl.description || base.description,
    meteo: {
      ...base.meteo,
      ...tpl.meteo,
    },
    operationImpact: {
      ...base.operationImpact,
      ...tpl.operationImpact,
    },
    cropImpacts: CROPS.map((crop) => {
      const ci = buildCropImpactTemplate(yearType, crop);
      return {
        cropId: crop.id,
        yieldFactor: ci.yieldFactor,
        note: ci.note,
      };
    }),
    notes: extra.notes || base.notes,
    id: extra.id ?? base.id,
  };
};

// Фіксований набір стартових сценаріїв
export const initialScenarios = [
  createScenarioForYearType("normal", {
    id: 1,
    code: "NORMAL",
    name: "Нормальний рік",
    isBaseline: true,
    probability: 0.3,
  }),
  createScenarioForYearType("dry", {
    id: 2,
    code: "DRY",
    name: "Посушливий рік",
    probability: 0.25,
  }),
  createScenarioForYearType("very_dry", {
    id: 3,
    code: "VERY_DRY",
    name: "Дуже сухий рік",
    probability: 0.15,
  }),
  createScenarioForYearType("wet", {
    id: 4,
    code: "WET",
    name: "Вологий рік",
    probability: 0.2,
  }),
  createScenarioForYearType("very_wet", {
    id: 5,
    code: "VERY_WET",
    name: "Дуже вологий рік",
    probability: 0.1,
  }),
];

// Щоб не тягнути CROPS окремо в різні файли,
// при потребі можна імпортувати з цього конфігу.
export { CROPS };
