import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Linking, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function Index() {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('INR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [results, setResults] = useState([]);

  const handleCompare = async () => {
    if (!amount) return;

    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      const data = await response.json();

      const rate = data.rates[toCurrency];
      const inputAmount = parseFloat(amount);

      // 🔥 SMART PLATFORM CONFIG
      const platforms = [
        {
          name: 'Wise',
          feePercent: 0.004,
          fixedFee: 75,
          rateMarkup: 0.001,
          speed: 'Fast',
          type: 'transparent',
          url: 'https://wise.com'
        },
        {
          name: 'PayPal',
          feePercent: 0.039,
          fixedFee: 0,
          rateMarkup: 0.035,
          speed: 'Instant',
          type: 'hidden_margin',
          url: 'https://paypal.com'
        },
        {
          name: 'Remitly',
          feePercent: 0.01,
          fixedFee: 50,
          rateMarkup: 0.015,
          speed: 'Medium',
          type: 'promo_based',
          url: 'https://remitly.com'
        },
        {
          name: 'Bank Transfer',
          feePercent: 0.02,
          fixedFee: 200,
          rateMarkup: 0.02,
          speed: 'Slow',
          type: 'traditional',
          url: 'https://yourbank.com'
        }
      ];

      // 🔥 CALCULATION
      const calculated = platforms.map(p => {
        const adjustedRate = rate * (1 - p.rateMarkup);
        const afterPercentFee = inputAmount * (1 - p.feePercent);
        const afterFixedFee = afterPercentFee - p.fixedFee;
        const converted = afterFixedFee * adjustedRate;

        return {
          name: p.name,
          value: converted,
          url: p.url,
          speed: p.speed,
          type: p.type
        };
      });

      // Sort best first
      calculated.sort((a, b) => b.value - a.value);

      const bestValue = calculated[0].value;

      const finalResults = calculated.map((item, index) => {
        const savings = bestValue - item.value;

        return {
          ...item,
          value: item.value.toFixed(2),
          savings: index === 0 ? 0 : savings.toFixed(2)
        };
      });

      setResults(finalResults);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>💱 Forex Compare</Text>

      <View style={styles.card}>

        <Text style={styles.label}>From Currency</Text>
        <View style={styles.dropdown}>
          <Picker selectedValue={fromCurrency} onValueChange={setFromCurrency}>
            <Picker.Item label="INR 🇮🇳" value="INR" />
            <Picker.Item label="USD 🇺🇸" value="USD" />
            <Picker.Item label="EUR 🇪🇺" value="EUR" />
            <Picker.Item label="AED 🇦🇪" value="AED" />
          </Picker>
        </View>

        <Text style={styles.label}>To Currency</Text>
        <View style={styles.dropdown}>
          <Picker selectedValue={toCurrency} onValueChange={setToCurrency}>
            <Picker.Item label="USD 🇺🇸" value="USD" />
            <Picker.Item label="INR 🇮🇳" value="INR" />
            <Picker.Item label="EUR 🇪🇺" value="EUR" />
            <Picker.Item label="AED 🇦🇪" value="AED" />
          </Picker>
        </View>

        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="Enter Amount"
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={handleCompare}>
          <Text style={styles.buttonText}>Compare Now</Text>
        </TouchableOpacity>

      </View>

      {/* RESULTS */}
      {results.map((item, index) => (
        <View
          key={index}
          style={[
            styles.resultBox,
            index === 0 && styles.bestBox
          ]}
        >

          <Text style={styles.platform}>
            {index === 0 ? '🏆 Best Option' : item.name}
          </Text>

          <Text style={styles.value}>
            {toCurrency} {item.value}
          </Text>

          {/* 💰 SAVINGS */}
          {index !== 0 && (
            <Text style={styles.savings}>
              You lose {toCurrency} {item.savings} vs best
            </Text>
          )}

          {index === 0 && (
            <Text style={styles.bestTag}>
              Highest return 💰
            </Text>
          )}

          {/* ⚡ SPEED */}
          <Text style={styles.speed}>
            Speed: {item.speed}
          </Text>

          {item.speed === 'Instant' && (
            <Text style={styles.fastTag}>
              ⚡ Fastest Option
            </Text>
          )}

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => Linking.openURL(item.url)}
          >
            <Text style={styles.linkText}>Proceed</Text>
          </TouchableOpacity>

        </View>
      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 15
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20
  },
  card: {
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20
  },
  label: {
    color: '#cbd5f5',
    marginBottom: 5
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15
  },
  button: {
    backgroundColor: '#22c55e',
    padding: 15,
    borderRadius: 8
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold'
  },
  resultBox: {
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },
  bestBox: {
    borderWidth: 2,
    borderColor: '#22c55e'
  },
  platform: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  value: {
    color: '#38bdf8',
    fontSize: 20,
    marginTop: 5
  },
  savings: {
    color: '#f87171',
    marginTop: 5
  },
  bestTag: {
    color: '#22c55e',
    marginTop: 5
  },
  speed: {
    color: '#94a3b8',
    marginTop: 5
  },
  fastTag: {
    color: '#facc15'
  },
  linkButton: {
    marginTop: 10,
    backgroundColor: '#22c55e',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  linkText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});