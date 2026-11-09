#include <iostream>
#include <fstream>
#include <vector>
#include <chrono>
#include <cstdio>
#include <cstdlib>
#include <cmath>
using namespace std;
using namespace std::chrono;

// ---------- Метод 1: сортировка вставками ----------
// Идём по массиву слева направо; каждый очередной элемент "вставляем"
// на своё место в уже отсортированной левой части, сдвигая большие элементы вправо.
void insertionSort(vector<int>& a) {
    for (size_t i = 1; i < a.size(); i++) {
        int key = a[i];                 // элемент, который вставляем
        int j = (int)i - 1;             // идём по отсортированной части справа налево
        while (j >= 0 && a[j] > key) {  // пока слева элемент больше key —
            a[j + 1] = a[j];            // сдвигаем его на одну позицию вправо
            j--;
        }
        a[j + 1] = key;                 // вставляем key в освободившееся место
    }
}

// ---------- Метод 2: быстрая сортировка ----------
// Выбираем опорный элемент (медиана из первого, среднего и последнего —
// это защищает от вырождения на почти отсортированных данных),
// делим массив на части "меньше опорного" и "больше опорного"
// и рекурсивно сортируем каждую часть.
int medianOfThree(vector<int>& a, int lo, int hi) {
    int mid = lo + (hi - lo) / 2;
    if (a[mid] < a[lo]) swap(a[mid], a[lo]);   // упорядочиваем a[lo] <= a[mid]
    if (a[hi]  < a[lo]) swap(a[hi],  a[lo]);
    if (a[hi]  < a[mid]) swap(a[hi], a[mid]);  // теперь a[mid] — медиана
    swap(a[mid], a[hi]);                       // опорный уходит в конец
    return a[hi];
}

int partition(vector<int>& a, int lo, int hi) {
    int pivot = medianOfThree(a, lo, hi);   // опорный элемент (лежит в a[hi])
    int i = lo - 1;                         // граница области "меньше опорного"
    for (int j = lo; j < hi; j++)
        if (a[j] <= pivot) {                // элемент уходит в левую область
            i++;
            swap(a[i], a[j]);
        }
    swap(a[i + 1], a[hi]);                  // опорный встаёт на своё место
    return i + 1;                           // позиция опорного элемента
}

void quickSort(vector<int>& a, int lo, int hi) {
    if (lo >= hi) return;                   // отрезок из 0–1 элемента уже отсортирован
    int p = partition(a, lo, hi);           // разбиение
    quickSort(a, lo, p - 1);                // левая часть
    quickSort(a, p + 1, hi);                // правая часть
}

void quickSort(vector<int>& a) { quickSort(a, 0, (int)a.size() - 1); }

// Загружает массив из тестового файла: первое число — количество элементов n,
// дальше идут n чисел по одному в строке.
vector<int> loadData(const char* name) {
    ifstream f(name);
    long long n;
    if (!(f >> n)) { fprintf(stderr, "не удалось прочитать %s\n", name); return {}; }
    vector<int> a(n);
    for (long long i = 0; i < n; i++) f >> a[i];
    return a;
}

// Сортирует копию массива обоими методами и возвращает времена (мкс).
pair<double, double> measure(const vector<int>& data) {
    vector<int> a = data;
    auto t1 = high_resolution_clock::now();
    insertionSort(a);
    auto t2 = high_resolution_clock::now();

    vector<int> b = data;
    auto t3 = high_resolution_clock::now();
    quickSort(b);
    auto t4 = high_resolution_clock::now();

    return {duration<double, micro>(t2 - t1).count(),
            duration<double, micro>(t4 - t3).count()};
}

int main(int argc, char* argv[]) {
    // --- Проверка правильности на коротком массиве ---
    vector<int> demo = {34, 7, 23, 32, 5, 62, 32, 2, 45};

    vector<int> a1 = demo;
    insertionSort(a1);
    cout << "Вставками: ";
    for (int x : a1) cout << x << " ";
    cout << "\n";

    vector<int> a2 = demo;
    quickSort(a2);
    cout << "Быстрая:   ";
    for (int x : a2) cout << x << " ";
    cout << "\n\n";

    // --- Режим тестовых файлов: sort file1 file2 ... ---
    // Замеры на готовых данных из папки tests (отсортированные и неотсортированные).
    if (argc > 1) {
        printf("   файл |       n | Вставками, мкс | Быстрая, мкс\n");
        for (int k = 1; k < argc; k++) {
            vector<int> data = loadData(argv[k]);
            if (data.empty()) continue;
            auto [ins, quick] = measure(data);
            printf("%7s | %7zu | %14.0f | %12.0f\n", argv[k], data.size(), ins, quick);
        }
        return 0;
    }

    // --- Оценка сложности для разных n (случайные массивы) ---
    printf("      n | Вставками, мкс | Быстрая, мкс | Вставками, байт | Быстрая, байт\n");
    for (int n : {1000, 5000, 10000, 25000, 50000}) {
        vector<int> data(n);                // один и тот же массив для обоих методов
        srand(42);
        for (int i = 0; i < n; i++) data[i] = rand();

        auto [ins, quick] = measure(data);

        long memIns   = 3 * sizeof(int);            // key, i, j — O(1)
        long memQuick = (long)(log2((double)n) * 48); // глубина рекурсии * размер кадра стека

        printf("%7d | %14.0f | %12.0f | %15ld | %13ld\n", n, ins, quick, memIns, memQuick);
    }
    return 0;
}
// g++ -std=c++17 sort.cpp -o sort && ./sort
// ./sort tests/snbc1.txt tests/unbc1.txt tests/snbb1.txt tests/unbb1.txt tests/snba1.txt tests/unba1.txt
