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
const codePath = "C:/Users/s1thx/Desktop/algoritms-c-IKIT-main/lab_4/hash.cpp";
const codeLines = fs.readFileSync(codePath, "utf8").replace(/\r\n/g, "\n").replace(/\n$/, "").split("\n")
  .map((l) => l.replace(/\s*\/\/.*$/, ""))
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
  center(T`«Хеш-таблицы»`, { bold: true, size: 32 }),
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

const codeParas = [
  para(run(T`Листинг программы (hash.cpp)`, { bold: true }), {
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

const tblWidths = [4400, 3000];
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
  ["Показатель", "Значение"],
  [
    ["Число ключей N", "50 000"],
    ["Средняя длина цепочки", "500"],
    ["Максимальная длина цепочки", "670"],
    ["Среднее время поиска, мкс", "0,42"],
  ],
);

const memTable = makeTable(
  ["Показатель", "Значение"],
  [
    ["Заголовки списков (M = 100)", "2 400 байт"],
    ["Узлы цепочек (50 000 × 24 байта)", "1 200 000 байт"],
    ["Итого", "1 202 400 байт"],
  ],
);

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
            para(run(T`Хеш-таблицы`, { size: 20 }), {
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
        body(T`Цель работы — изучить хеш-таблицы. Необходимо разработать программу, реализующую хеш-таблицу с заданными методом хеширования и способом разрешения коллизий и поддерживающую операции вставки, поиска и удаления элементов, а также выполнить теоретическую и экспериментальную оценку временной и пространственной сложности операций.`),

        h1(T`2 Задание на вариант`),
        body(T`Вариант 8. Метод хеширования — середина квадрата; способ разрешения коллизий — метод цепочек; количество ячеек таблицы M = 100. Ключи (целые числа) загружаются из тестового файла.`),

        h1(T`3 Исходный код`),
        body(T`Хеш-таблица реализована как массив из M = 100 ячеек, каждая из которых содержит список (std::list) ключей, попавших в эту ячейку. Хеш-функция использует метод середины квадрата: ключ возводится в квадрат, из середины результата извлекаются цифры, и берётся остаток от деления на M. Коллизии разрешаются методом цепочек: все ключи с одинаковым хешем хранятся в одном списке. Операции has (поиск), add (вставка без дубликатов) и del (удаление) вычисляют хеш ключа и работают только с одной цепочкой.`),
        body(T`Программа работает в интерактивном режиме (меню): загрузка ключей из файла, поиск, удаление, вывод таблицы и замер характеристик. В режиме замера функция experiment загружает указанный файл, вычисляет среднюю и максимальную длину цепочек, измеряет среднее время поиска существующего ключа (по десяти полным проходам по всем ключам) и подсчитывает объём занятой памяти.`),
        ...codeParas,

        h1(T`4 Теоретические оценки`),
        h2(T`4.1 Временная сложность`),
        body(T`Обозначим n — число ключей в таблице, M — число ячеек. Вычисление хеш-функции выполняется за постоянное время O(1), так как длина ключа (число цифр) ограничена. При равномерном распределении ключей средняя длина цепочки равна коэффициенту заполнения α = n/M, поэтому операции вставки, поиска и удаления в среднем выполняются за O(1 + α). Пока таблица достаточно велика (M сопоставимо с n), это константа O(1). При фиксированном M = 100 коэффициент заполнения растёт линейно с n, и время операций фактически становится линейным — O(n). В худшем случае, когда все ключи попадают в одну ячейку, любая операция вырождается в O(n). Построение таблицы из n ключей занимает O(n).`),
        h2(T`4.2 Пространственная сложность`),
        body(T`Таблица хранит M заголовков списков и n узлов цепочек (каждый узел std::list содержит ключ и два указателя — около 24 байт). Объём дополнительной памяти равен O(M + n) и при M ≪ n определяется числом ключей — O(n).`),

        h1(T`5 Экспериментальные оценки`),
        body(T`Эксперимент проводился самой программой на тестовом файле unba1.txt (50 000 неотсортированных чисел) — наибольшем неотсортированном числовом тесте. Среднее время поиска измерялось с помощью библиотеки std::chrono по десяти полным проходам поиска всех существующих ключей. Память вычислялась расчётным способом: M заголовков списков и n узлов по 24 байта. Компиляция выполнялась компилятором g++ (стандарт C++17) с оптимизацией -O2.`),
        h2(T`5.1 Временная сложность`),
        para(run(T`Таблица 1 — Характеристики хеш-таблицы на файле unba1.txt`, { size: 24 }), { alignment: AlignmentType.CENTER }),
        timeTable,
        para(run(""), { spacing: { after: 120 } }),
        body(T`Средняя длина цепочки составила ровно n/M = 500, что совпадает с теоретическим значением коэффициента заполнения. Максимальная длина цепочки (670) лишь на треть превышает среднюю — это говорит о равномерном распределении ключей методом середины квадрата: сильных скоплений (длинных цепочек) не образуется. Среднее время успешного поиска составило 0,42 мкс: поиск требует в среднем просмотра половины цепочки (около 250 сравнений) и поэтому пропорционален α, а не n. Для сравнения, последовательный поиск по тем же 50 000 элементов потребовал бы в среднем 25 000 сравнений.`),
        h2(T`5.2 Пространственная сложность`),
        para(run(T`Таблица 2 — Объём памяти, занимаемой хеш-таблицей`, { size: 24 }), { alignment: AlignmentType.CENTER }),
        memTable,
        para(run(""), { spacing: { after: 120 } }),
        body(T`Основную часть памяти занимают узлы цепочек — по 24 байта на каждый из 50 000 ключей, тогда как заголовки списков дают лишь 2 400 байт. Это подтверждает оценку O(M + n): при M ≪ n память растёт линейно с числом ключей.`),
        body(T`Таким образом, экспериментальные оценки подтверждают теоретические: при равномерном распределении ключей время операций с хеш-таблицей определяется коэффициентом заполнения α = n/M, а не размером данных, поэтому даже на 50 000 ключей поиск выполняется за доли микросекунды; память растёт линейно с числом хранимых ключей.`),
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(outputPath, buffer);
