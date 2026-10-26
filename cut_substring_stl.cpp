#include <iostream>
#include <cstring>
#include <chrono>
#include <cstdio>
#include <list>
#include <string>
using namespace std;
using namespace std::chrono;

void cutFromArray(char s[], const char sub[]) {
    int n = strlen(s);
    int m = strlen(sub);
    int pos = -1;                           
    for (int i = 0; i + m <= n; i++) {
        bool match = true;
        for (int j = 0; j < m; j++)
            if (s[i + j] != sub[j]) { match = false; break; }
        if (match) { pos = i; break; }
    }
    if (pos == -1) return;                  
    for (int i = pos; i <= n - m; i++)      
        s[i] = s[i + m];
}

void cutFromList(list<char>& lst, const string& sub) {
    for (auto it = lst.begin(); it != lst.end(); ++it) {
        auto p = it;
        size_t j = 0;
        while (j < sub.size() && p != lst.end() && *p == sub[j]) { ++p; ++j; }
        if (j == sub.size()) { lst.erase(it, p); return; }   
    }
}

int main() {
    char s1[] = "Hello world";
    cutFromArray(s1, " world");
    cout << "Массив:  " << s1 << "\n";

    string src = "Hello world";
    list<char> demo(src.begin(), src.end());   
    cutFromList(demo, " world");
    cout << "Список:  ";
    for (char c : demo) cout << c;             
    cout << "\n\n";                            

    long sizes[] = {100000, 500000, 1000000, 2000000, 5000000};
    printf("        n | Массив, мкс | Список, мкс | Массив, байт | Список, байт\n");
    for (long n : sizes) {
        char* base = new char[n + 1];
        for (long i = 0; i < n - 1; i++) base[i] = 'a';
        base[n - 1] = 'b';
        base[n] = '\0';

        char* arr = new char[n + 1];
        strcpy(arr, base);
        auto t1 = high_resolution_clock::now();
        cutFromArray(arr, "b");
        auto t2 = high_resolution_clock::now();
        delete[] arr;

        auto t3 = high_resolution_clock::now();
        list<char> lst(base, base + n);
        cutFromList(lst, "b");
        auto t4 = high_resolution_clock::now();

        long memArr  = 6 * sizeof(int);   
        long memList = n * 24;            

        printf("%9ld | %11.1f | %11.1f | %12ld | %12ld\n", n,
               duration<double, micro>(t2 - t1).count(),   
               duration<double, micro>(t4 - t3).count(),   
               memArr, memList);
        delete[] base;
    }
    return 0;
}