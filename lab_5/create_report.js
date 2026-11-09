import fs from "node:fs";
import path from "node:path";
import {
  AlignmentType,
  Document,
  Footer,
  Header,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  convertInchesToTwip,
} from "docx";

const outputPath = process.argv[2];
if (!outputPath) throw new Error("Usage: node create_report.js /absolute/path/output.docx");

const T = String.raw;
const codePath = "C:/Users/s1thx/Desktop/algoritms-c-IKIT-main/lab_5/sort.cpp";
const codeLines = fs.readFileSync(codePath, "utf8").replace(/\r\n/g, "\n").replace(/\n$/, "").split("\n")
  .map((l) => l.replace(/\s*\/\/.*$/, ""))   // убираем комментарии из листинга
  .filter((l) => l.trim() !== "");

const font = {
  ascii: "Times New Roman",
  hAnsi: "Times New Roman",
  cs: "Times New Roman",
  eastAsia: "SimSun",
};

const run = (text, options = {}) =>
  new TextRun({ text, font, size: 28, ...options });

const para = (children, options = {}) =>
  new Paragraph({
    spacing: { after: 120, line: 360 },
    ...options,
    children: Array.isArray(children) ? children : [children],
  });

const body = (text) =>
  para(run(text), {
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: convertInchesToTwip(0.49) },
  });

const h1 = (text) =>
  para(run(text, { bold: true }), {
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 120 },
  });

const h2 = (text) =>
  para(run(text, { bold: true }), {
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 100 },
  });

const center = (text, options = {}) =>
  para(run(text, options), { alignment: AlignmentType.CENTER });

// ---------- титульный лист ----------
const cover = [
  center(T`Федеральное государственное автономное`, { size: 24 }),
  center(T`образовательное учреждение`, { size: 24 }),
  center(T`высшего образования`, { size: 24 }),
  center(T`«СИБИРСКИЙ ФЕДЕРАЛЬНЫЙ УНИВЕРСИТЕТ»`, { size: 24 }),
  para(run(""), { spacing: { after: 240 } }),
  center(T`Институт космических и информационных технологий`),
  center(T`Кафедра вычислительной техники`),
  para(run(""), { spacing: { after: 2400 } }),
  center(T`ОТЧЕТ О ПРАКТИЧЕСКОЙ РАБОТЕ`, { bold: true, size: 32 }),
  center(T`«Алгоритмы сортировки»`, { bold: true, size: 32 }),
  para(run(""), { spacing: { after: 2400 } }),
];

const sigWidths = [3855, 2500, 3000];
const sigCell = (text, options = {}) =>
  new TableCell({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [run(text, { size: 22 })],
      }),
    ],
    borders: {
      top: { style: "none", size: 0, color: "FFFFFF" },
      bottom: { style: "none", size: 0, color: "FFFFFF" },
      left: { style: "none", size: 0, color: "FFFFFF" },
      right: { style: "none", size: 0, color: "FFFFFF" },
    },
    ...options,
  });

const sigTable = new Table({
  width: { size: sigWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
  columnWidths: sigWidths,
  rows: [
    new TableRow({ children: [
      sigCell(T`Преподаватель`),
      sigCell(T`__________`),
      sigCell(T`Д. С. Романова`),
    ] }),
    new TableRow({ children: [
      sigCell(``),
      sigCell(T`подпись, дата`, { size: 18 }),
      sigCell(T`инициалы, фамилия`, { size: 18 }),
    ] }),
    new TableRow({ children: [
      sigCell(T`Студент КИ25-06Б`),
      sigCell(T`__________`),
      sigCell(T`____________`),
    ] }),
    new TableRow({ children: [
      sigCell(T`номер группы`, { size: 18 }),
      sigCell(T`подпись, дата`, { size: 18 }),
      sigCell(T`инициалы, фамилия`, { size: 18 }),
    ] }),
  ],
});

const coverTail = [
  sigTable,
  para(run(""), { spacing: { after: 2400 } }),
  center(T`Красноярск 2026`),
];

// ---------- листинг ----------
const codeParas = [
  para(run(T`Листинг программы (sort.cpp)`, { bold: true }), {
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120 },
  }),
  ...codeLines.map((line) =>
    new Paragraph({
      spacing: { after: 0, line: 240 },
      children: [
        new TextRun({
          text: line === "" ? " " : line,
          font: { ascii: "Consolas", hAnsi: "Consolas", cs: "Consolas", eastAsia: "SimSun" },
          size: 18,
        }),
      ],
    }),
  ),
];

// ---------- таблицы ----------
const tblWidths = [2200, 2600, 2600];
const cell = (text, options = {}) =>
  new TableCell({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [run(text, { size: 24 })],
      }),
    ],
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    ...options,
  });

const makeTable = (header, rows) =>
  new Table({
    width: { size: tblWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: tblWidths,
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        children: header.map((t, i) =>
          cell(t, {
            shading: { type: ShadingType.CLEAR, fill: "EEF3F6" },
            width: { size: tblWidths[i], type: WidthType.DXA },
          }),
        ),
      }),
      ...rows.map(
        (r) =>
          new TableRow({
            children: r.map((t, i) =>
              cell(t, { width: { size: tblWidths[i], type: WidthType.DXA } }),
            ),
          }),
      ),
    ],
  });

const timeTable = makeTable(
  ["n", "Вставками, мкс", "Быстрая, мкс"],
  [
    ["1 000", "102", "30"],
    ["5 000", "1 832", "168"],
    ["10 000", "4 833", "362"],
    ["25 000", "29 924", "967"],
    ["50 000", "121 262", "1 957"],
  ],
);

const fileTable = makeTable(
  ["Файл (n)", "Вставками, мкс", "Быстрая, мкс"],
  [
    ["unba1 (50 000)", "131 889", "2 016"],
  ],
);

const memTable = makeTable(
  ["n", "Вставками, байт", "Быстрая, байт"],
  [
    ["1 000", "12", "478"],
    ["5 000", "12", "589"],
    ["10 000", "12", "637"],
    ["25 000", "12", "701"],
    ["50 000", "12", "749"],
  ],
);

// ---------- документ ----------
const doc = new Document({
  features: { updateFields: false },
  sections: [
    {
      properties: {
        titlePg: true,
        page: {
          margin: { top: 1134, right: 850, bottom: 1134, left: 1701 },
        },
      },
      headers: {
        default: new Header({
          children: [
            para(run(T`Алгоритмы сортировки`, { size: 20 }), {
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
        first: new Header({ children: [para(run(""))] }),
      },
      footers: {
        default: new Footer({
          children: [
            para(new TextRun({ children: [PageNumber.CURRENT], font, size: 20 }), {
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
        first: new Footer({ children: [para(run(""))] }),
      },
      children: [
        ...cover,
        ...coverTail,

        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          pageBreakBefore: true,
          spacing: { before: 240, after: 120 },
          children: [run(T`1 Задание на работу`, { bold: true })],
        }),
        body(T`Цель работы — изучить алгоритмы сортировки. Необходимо разработать программы, демонстрирующие два заданных метода сортировки, выполнить теоретическую и экспериментальную оценку временной и пространственной сложности алгоритмов и сравнить их эффективность.`),

        h1(T`2 Задание на вариант`),
        body(T`Вариант 9. Первый метод — сортировка вставками, второй метод — быстрая сортировка.`),

        h1(T`3 Исходный код`),
        body(T`Для решения задачи разработаны два алгоритма сортировки массива целых чисел. Сортировка вставками последовательно проходит по массиву слева направо и каждый очередной элемент вставляет на своё место в уже отсортированной левой части, сдвигая большие элементы вправо. Быстрая сортировка выбирает опорный элемент (медиану из первого, среднего и последнего — это защищает от вырождения на почти отсортированных данных), делит массив на части «меньше опорного» и «больше опорного» и рекурсивно сортирует каждую часть.`),
        body(T`В функции main сначала проверяется правильность обеих реализаций на коротком массиве, а затем для случайных массивов разной длины n измеряется время работы каждого алгоритма и подсчитывается объём используемой ими дополнительной памяти. Оба метода сортируют один и тот же исходный массив (генерируется с фиксированным зерном srand(42)), что обеспечивает одинаковые условия сравнения.`),
        body(T`Кроме того, программа поддерживает режим замеров на готовых тестовых файлах: имена файлов передаются аргументами командной строки, функция loadData загружает массив (первое число файла — количество элементов), после чего обе сортировки выполняются на одних и тех же данных. Для итогового замера выбран файл unba1.txt — 50 000 неотсортированных чисел: это наибольший неотсортированный числовой тест, на котором различие методов проявляется сильнее всего.`),
        ...codeParas,

        h1(T`4 Теоретические оценки`),
        h2(T`4.1 Временная сложность`),
        body(T`Обозначим n — количество сортируемых элементов.`),
        body(T`Сортировка вставками состоит из внешнего цикла по n − 1 элементу и внутреннего цикла, сдвигающего элементы отсортированной части. В худшем случае (массив отсортирован по убыванию) внутренний цикл делает i итераций для каждого i от 1 до n − 1, что в сумме даёт n(n − 1)/2 операций — квадратичная сложность O(n²). В среднем случае для каждого элемента сдвигается примерно половина отсортированной части, что также даёт O(n²). В лучшем случае (массив уже отсортирован) внутренний цикл не выполняет ни одного сдвига, поэтому сложность линейна — O(n).`),
        body(T`Быстрая сортировка на каждом уровне рекурсии выполняет разбиение отрезка массива за линейное время O(n). При удачном выборе опорного элемента массив делится примерно пополам, поэтому глубина рекурсии составляет log₂n, а итоговая сложность в среднем случае — O(n·log n). В худшем случае, когда опорный элемент каждый раз оказывается минимальным или максимальным, разбиения вырождаются, глубина рекурсии достигает n, и сложность становится квадратичной — O(n²). Выбор опорного элемента как медианы из трёх (первого, среднего и последнего) делает худший случай маловероятным, в том числе на уже отсортированных массивах.`),
        h2(T`4.2 Пространственная сложность`),
        body(T`Сортировка вставками выполняется «на месте» и использует лишь несколько вспомогательных переменных (текущий элемент и индексы), поэтому её дополнительная пространственная сложность постоянна — O(1).`),
        body(T`Быстрая сортировка также работает «на месте», однако тратит память на кадры стека рекурсивных вызовов. При сбалансированных разбиениях глубина рекурсии составляет log₂n, поэтому дополнительная пространственная сложность в среднем случае — O(log n). В худшем случае (вырожденные разбиения) глубина рекурсии достигает n, и пространственная сложность вырождается до O(n).`),

        h1(T`5 Экспериментальные оценки`),
        body(T`Эксперименты проводились самой программой в двух сериях: на случайных массивах длиной n, генерируемых с фиксированным зерном, и на готовом тестовом файле unba1.txt (50 000 неотсортированных чисел). Время работы каждой реализации измерялось с помощью библиотеки std::chrono. Дополнительная память вычислялась расчётным способом: для сортировки вставками — как объём вспомогательных переменных (3 переменные типа int), для быстрой сортировки — как глубина рекурсии log₂n, умноженная на размер кадра стека (48 байт). Компиляция выполнялась компилятором g++ (стандарт C++17) с оптимизацией -O2.`),
        h2(T`5.1 Временная сложность`),
        para(run(T`Таблица 1 — Время работы на случайных массивах`, { size: 24 }), { alignment: AlignmentType.CENTER }),
        timeTable,
        para(run(""), { spacing: { after: 120 } }),
        body(T`С ростом n время сортировки вставками растёт квадратично: при увеличении n в 50 раз время возрастает более чем в 1000 раз, а при удвоении n с 25 000 до 50 000 — примерно в 4 раза, что подтверждает теоретическую оценку O(n²). Время быстрой сортировки растёт почти линейно (при увеличении n в 50 раз время возрастает лишь примерно в 65 раз), что согласуется с оценкой O(n·log n): отношение времени к n·log₂n остаётся почти постоянным. На случайном массиве из 50 000 элементов быстрая сортировка оказывается примерно в 62 раза быстрее сортировки вставками.`),
        para(run(T`Таблица 2 — Время работы на тестовом файле unba1.txt`, { size: 24 }), { alignment: AlignmentType.CENTER }),
        fileTable,
        para(run(""), { spacing: { after: 120 } }),
        body(T`Замер на тестовом файле подтверждает результаты, полученные на случайных массивах: для n = 50 000 время сортировки вставками составляет около 132 мс, а быстрой сортировки — около 2 мс, то есть быстрая сортировка примерно в 65 раз эффективнее. Близость этих значений к результатам на случайном массиве того же размера (121 мс и 2 мс) показывает, что выводы не зависят от конкретных входных данных и носят общий характер.`),
        h2(T`5.2 Пространственная сложность`),
        para(run(T`Таблица 3 — Объём дополнительной памяти, используемой реализациями`, { size: 24 }), { alignment: AlignmentType.CENTER }),
        memTable,
        para(run(""), { spacing: { after: 120 } }),
        body(T`Дополнительная память сортировки вставками не зависит от размера массива (несколько байт), что подтверждает оценку O(1). Память быстрой сортировки растёт логарифмически — примерно по одному кадру стека (48 байт) на каждое удвоение n, — что подтверждает оценку O(log n).`),
        body(T`Таким образом, экспериментальные оценки подтверждают теоретические: на произвольных данных быстрая сортировка существенно эффективнее по времени и её преимущество растёт с ростом n, тогда как сортировка вставками не требует дополнительной памяти и целесообразна на малых или почти отсортированных массивах, где её время работы близко к линейному и она обгоняет даже быструю сортировку.`),
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(outputPath, buffer);
