#include "HashTable.h"
#include <iostream>

HashTable::HashTable(int size) : tableSize(size), accessCount(0) {
    table.resize(size, -1);  // Initialize all slots to -1 (empty)
}

void HashTable::add(int key) {
    int index = key % tableSize;  // Hash function
    int originalIndex = index;

    // Linear probing for collision resolution
    while (table[index] != -1) {
        index = (index + 1) % tableSize;
        accessCount++;

        // Check for infinite loop
        if (index == originalIndex) {
            std::cout << "Error: Hash table is full!" << std::endl;
            return;
        }
    }

    table[index] = key;
    accessCount++;
}

bool HashTable::find(int key) {
    int index = key % tableSize;  // Hash function
    int originalIndex = index;

    // Linear probing for collision resolution
    while (table[index] != -1) {
        accessCount++;
        if (table[index] == key) {
            return true;  // Key found
        }
        index = (index + 1) % tableSize;

        // Check for infinite loop
        if (index == originalIndex) {
            break;
        }
    }

    return false;  // Key not found
}

void HashTable::resetAccessCount() {
    accessCount = 0;
}

int HashTable::getAccessCount() const {
    return accessCount;
}

void HashTable::printTable() const {
    for (int i = 0; i < tableSize; ++i) {
        std::cout << "[" << i << "]: " << table[i] << std::endl;
    }
}
