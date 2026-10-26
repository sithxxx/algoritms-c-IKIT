#include <iostream>
#include <cstring>
#include <chrono>
#include <cstdio>
using namespace std;
using namespace std::chrono;

// ---------- Структура 1: массив (реализован самостоятельно) ----------
// Вырезает первое вхождение подстроки sub из строки s (массив символов).
void cutFromArray(char s[], const char sub[]) {
    int n = strlen(s);
    int m = strlen(sub);
    int pos = -1;                           // позиция первого вхождения
    for (int i = 0; i + m <= n; i++) {
        bool match = true;
        for (int j = 0; j < m; j++)
            if (s[i + j] != sub[j]) { match = false; break; }
        if (match) { pos = i; break; }
    }
    if (pos == -1) return;                  // подстрока не найдена
    for (int i = pos; i <= n - m; i++)      // сдвигаем хвост влево на m символов
        s[i] = s[i + m];
}

// ---------- Структура 2: двусвязный список (реализован самостоятельно) ----------
struct Node {
    char c;
    Node* prev;
    Node* next;
};

Node* buildList(const char s[]) {           // строит список из строки
    Node* head = nullptr;
    Node* tail = nullptr;
    for (int i = 0; s[i] != '\0'; i++) {
        Node* node = new Node{s[i], tail, nullptr};
        if (head == nullptr) head = node;
        else tail->next = node;
        tail = node;
    }
    return head;
}

void cutFromList(Node*& head, const char sub[]) {   // вырезает первое вхождение sub
    int m = strlen(sub);
    for (Node* start = head; start != nullptr; start = start->next) {
        Node* p = start;
        int j = 0;
        while (j < m && p != nullptr && p->c == sub[j]) { p = p->next; j++; }
        if (j == m) {                       // нашли: вырезаем узлы start..(перед p)
            Node* before = start->prev;
            Node* after  = p;
            if (before) before->next = after; else head = after;
            if (after)  after->prev  = before;
            return;
        }
    }
}

void printList(Node* head) {                // выводит список на экран
    for (Node* p = head; p != nullptr; p = p->next) cout << p->c;
    cout << "\n";
}

void freeList(Node* head) {                 // освобождает память списка
    while (head != nullptr) { Node* nx = head->next; delete head; head = nx; }
}

int main() {
    const char* sub = "wonderful ";         // вырезаемая подстрока

    // --- Проверка правильности на короткой строке ---
    char s1[] = "Hello wonderful world";
    cutFromArray(s1, sub);
    cout << "Массив:  " << s1 << "\n";

    Node* demo = buildList("Hello wonderful world");
    cutFromList(demo, sub);
    cout << "Список:  ";
    printList(demo);
    cout << "\n";

    // --- Оценка сложности для разных n ---
    long sizes[] = {100000, 500000, 1000000, 2000000, 5000000};
    printf("        n | Массив, мкс | Список, мкс | Массив, байт | Список, байт\n");
    for (long n : sizes) {
        // строка из (n-1) символов 'a' и 'b' в конце; вырезаем "b"
        char* base = new char[n + 1];
        for (long i = 0; i < n - 1; i++) base[i] = 'a';
        base[n - 1] = 'b';
        base[n] = '\0';
        const char* one = "b";

        // массив: измеряем время вырезания
        char* arr = new char[n + 1];
        strcpy(arr, base);
        auto t1 = high_resolution_clock::now();
        cutFromArray(arr, one);
        auto t2 = high_resolution_clock::now();
        delete[] arr;

        // список: измеряем построение + вырезание
        auto t3 = high_resolution_clock::now();
        Node* head = buildList(base);
        cutFromList(head, one);
        auto t4 = high_resolution_clock::now();
        freeList(head);

        long memArr  = 6 * sizeof(int);         // несколько переменных
        long memList = n * (long)sizeof(Node);  // n узлов списка

        printf("%9ld | %11.1f | %11.1f | %12ld | %12ld\n", n,
               duration<double, micro>(t2 - t1).count(),   // время массива
               duration<double, micro>(t4 - t3).count(),   // время списка
               memArr, memList);
        delete[] base;
    }
    return 0;
}
// g++ -std=c++17 cut_substring.cpp -o cut_substring && ./cut_substring