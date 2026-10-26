#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <algorithm>
#include <chrono>
#include <cstdio>
using namespace std;
using namespace std::chrono;

int sequentialSearch(const vector<string>& a, const string& x) {
    for (int i = 0; i < (int)a.size(); i++)
        if (a[i] == x) return i;
    return -1;
}

unsigned long long key(const string& s) {
    unsigned long long k = 0;
    for (int i = 0; i < 6; i++)
        k = k * 256 + (i < (int)s.size() ? (unsigned char)s[i] : 0);
    return k;
}

int interpolationSearch(const vector<string>& a, const string& x) {
    int low = 0, high = (int)a.size() - 1;
    unsigned long long kx = key(x);
    while (low <= high) {
        unsigned long long kl = key(a[low]), kh = key(a[high]);
        if (kx < kl || kx > kh) break;
        int pos = low;
        if (kh != kl) pos = low + (int)((long double)(kx - kl) / (kh - kl) * (high - low));
        if (a[pos] == x) return pos;
        if (a[pos] < x) low = pos + 1;
        else high = pos - 1;
    }
    return -1;
}

vector<string> readFile(const string& name) {
    ifstream in(name);
    int n = 0;
    in >> n;
    vector<string> a(n);
    for (auto& s : a) in >> s;
    return a;
}

int main(int argc, char* argv[]) {
    if (argc == 3) {
        vector<string> a = readFile(argv[1]);
        vector<string> s = a;
        sort(s.begin(), s.end());
        cout << "Последовательный: " << sequentialSearch(a, argv[2]) << "\n";
        cout << "Интерполирующий (индекс в отсортированном): " << interpolationSearch(s, argv[2]) << "\n";
        return 0;
    }

    string dir = argc == 2 ? argv[1] : "tests";
    const int Q = 1000;
    cout << "файл             N  посл.(мкс)  сорт.(мс)  интерп.(мкс)  доп.память(байт)  проверка\n";
    for (string group : {"ucba", "ucbb", "ucbc"})
        for (int t = 1; t <= 20; t++) {
            string name = group + to_string(t) + ".txt";
            vector<string> a = readFile(dir + "/" + name);
            if (a.empty()) continue;
            int n = a.size();
            bool ok = true;

            auto t0 = steady_clock::now();
            for (int i = 0; i < Q; i++) {
                //string x = a[(long long)i * n / Q];
                string x = "a";
                int r = sequentialSearch(a, "a");
                ok = ok && r >= 0 && a[r] == x;
            }
            auto t1 = steady_clock::now();
            vector<string> s = a; 
            sort(s.begin(), s.end());
            auto t2 = steady_clock::now();
            for (int i = 0; i < Q; i++) {
                string x = a[(long long)i * n / Q];
                int r = interpolationSearch(s, x);
                ok = ok && r >= 0 && s[r] == x;
            }
            auto t3 = steady_clock::now();

            string absent = a[0] + "#"; 
            ok = ok && sequentialSearch(a, absent) == -1 && interpolationSearch(s, absent) == -1;

            printf("%-11s %6d %11.3f %10.3f %13.3f %17zu  %s\n", name.c_str(), n,
                   duration<double, micro>(t1 - t0).count() / Q,
                   duration<double, milli>(t2 - t1).count(),
                   duration<double, micro>(t3 - t2).count() / Q,
                   n * sizeof(string), ok ? "OK" : "ОШИБКА");
        }
    return 0;
}

// .vscode/lab_3/search - прогон тестов и замеры 
// .vscode/lab_3/search tests/ucba1.txt svrf - поиск одной строки 
// clang++ -std=c++17 -O2 -o .vscode/lab_3/search .vscode/lab_3/search.cpp