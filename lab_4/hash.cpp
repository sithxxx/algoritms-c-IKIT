#include <iostream>
#include <fstream>
#include <list>
#include <algorithm>
#include <chrono>
using namespace std;

const int M = 100;
list<long long> table[M];

int hashKey(long long key) {
    long long sq = key * key;
    int len = 0;
    for (long long t = sq; t > 0; t /= 10) len++;
    for (int i = 0; i < len / 2 - 1; i++) sq /= 10; 
    return sq % M;
}

bool has(long long k) {
    list <long long>& c = table[hashKey(k)];
    return find(c.begin(), c.end(), k) != c.end();
}

bool add(long long k) {
    if (has(k)) return false;
    table[hashKey(k)].push_back(k);
    return true;
}

bool del(long long k) {
    list<long long>& c = table[hashKey(k)];
    size_t n = c.size();
    c.remove(k);
    return c.size() < n;
}

void load(const string& name) {
    ifstream f(name);
    long long n, x;
    if (!(f >> n)) { cout << "не удалось прочитать файл\n"; return; }
    for (auto& c : table) c.clear();
    for (long long i = 0; i < n && f >> x; i++) add(x);
}

void print() {
    for (int i = 0; i < M; i++) {
        if (table[i].empty()) continue;
        cout << i << ":";
        for (long long x : table[i]) cout << " " << x;
        if (table[i].size() > 1) cout << " - коллизия";
        cout << "\n";
    }
}

void experiment(const string& name) {
    load(name);
    long long n = 0, longest = 0;
    for (auto& c : table) { n += c.size(); longest = max(longest, (long long)c.size()); }
    auto t1 = chrono::steady_clock::now();
    for (long long k = 100000; k < 105000; k++) has(k);
    auto t2 = chrono::steady_clock::now();
    double us = chrono::duration<double, micro>(t2 - t1).count() / 5000;
    cout << "N=" << n << " средняя цепочка=" << (double)n / M << " максимум=" << longest << " поиск=" << us << " мкс память=" << M * sizeof(list<long long>) + n * 24 << " byte\n";
}

int main(int args, char* argv[]) {
    const char* menu = "\n1 - download file, 2 - searched, 3 - delete, 4 - показать, 5 - замер, 0 - выход: ";
    if (args > 1) { load(argv[1]); print(); }
    int cmd;
    long long x;
    string name;
    cout << menu;
    while (cin >> cmd && cmd != 0) {
        if (cmd == 1) {
            cout << "file name: ";
            cin >> name;
            load(name);
            print();
        } else if (cmd == 4) {
            print();
        } else if (cmd == 5) {
            cout << "file name: ";
            cin >> name; 
            experiment(name);
        } else if (cmd == 2 || cmd == 3) {
            cout << "number: ";
            cin >> x;
            cout << x << "^2 = " << x * x << " -> ячейка " << hashKey(x) << "\n";
            if (cmd == 2) cout << (has(x) ? "найдено" : "не найдено") << "\n";
            else cout << (del(x) ? "удалено" : "такого числа нет") << "\n";
        }
        cout << menu;
    }
    return 0;
}