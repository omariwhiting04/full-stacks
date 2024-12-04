#ifndef HASHTABLE_H
#define HASHTABLE_H

#include <vector>

class HashTable {
private:
    std::vector<int> table;  // The hash table
    int tableSize;           // Size of the table
    int accessCount;         // Counter for data accesses

public:
    // Constructor
    HashTable(int size);

    // Adds an item to the table
    void add(int key);

    // Finds an item in the table
    bool find(int key);

    // Resets the access counter
    void resetAccessCount();

    // Returns the access count
    int getAccessCount() const;

    // Prints the current state of the table (for debugging)
    void printTable() const;
};

#endif
