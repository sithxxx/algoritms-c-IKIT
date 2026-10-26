#include <iostream>
#include <vector>
#include <chrono>
#include <cstdio>
#include <cstdlib>
using namespace std;
using namespace std::chrono;

int findMaxLinear(const vector<int>& a) {
    int maxVal = a[0];
    for (size_t i = 1; i < a.size(); i++)
        if (a[i] > maxVal) maxVal = a[i];
    return maxVal;
}

int findMaxBySort(const vector<int>& a) {
    vector<int> b = a;                          
    for (size_t i = 0; i + 1 < b.size(); i++) {
        size_t minIdx = i;
        for (size_t j = i + 1; j < b.size(); j++)
            if (b[j] < b[minIdx]) minIdx = j;
        swap(b[i], b[minIdx]);
    }
    return b.back();
}

int main() {
    vector<int> demo = {3, 17, 8, 42, 15, 4, 23};
    cout << "Максимум (алг.1): " << findMaxLinear(demo) << "\n";
    cout << "Максимум (алг.2): " << findMaxBySort(demo) << "\n\n";

    printf("    N | Алг.1, мкс | Алг.2, мкс | Алг.1, байт | Алг.2, байт\n");
    for (int N : {1000, 5000, 10000, 25000, 50000}) {
        vector<int> data(N);
        for (int i = 0; i < N; i++) data[i] = rand();

        auto t1 = high_resolution_clock::now();
        findMaxLinear(data);                    
        auto t2 = high_resolution_clock::now();
        findMaxBySort(data);                    
        auto t3 = high_resolution_clock::now();

        printf("%5d | %10.1f | %10.0f | %11d | %11d\n", N,
               duration<double, micro>(t2 - t1).count(),   
               duration<double, micro>(t3 - t2).count(),   
               (int)(2 * sizeof(int)),                     
               (int)(N * sizeof(int)));                    
    }
    return 0;
}