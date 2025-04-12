// Tabs.js
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';

const Tabs = ({ tabs, role }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const activeTabColor = role === 'admin' ? '#b5651d' : '#006400';

  return (
    <View style={styles.container}>
      <View style={[styles.tabContainer, { borderColor: activeTabColor }]}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tab,
              activeTabIndex === index && { backgroundColor: activeTabColor },
              index === 0 && styles.firstTab,
              index === tabs.length - 1 && styles.lastTab,
            ]}
            onPress={() => setActiveTabIndex(index)}
          >
            <Text style={[styles.tabText, activeTabIndex === index && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.contentContainer}>{tabs[activeTabIndex]?.content}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    // marginHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  firstTab: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  lastTab: {
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  tabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
    padding: 10,
  },
});

export default Tabs;
