import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Fuentes genéricas, sin marca
Font.register({
  family: 'Open Sans',
  src: 'https://fonts.gstatic.com/s/opensans/v18/mem8YaGs126MiZpBA-UFVZ0e.ttf'
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Open Sans'
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  content: {
    fontSize: 11,
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  date: {
    fontSize: 10,
    textAlign: 'right',
    marginTop: 30,
  }
});

interface SimplePDFProps {
  title: string;
  content: string;
  date?: string;
}

export const SimplePDFDocument: React.FC<SimplePDFProps> = ({ title, content, date }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>{title.toUpperCase()}</Text>
        <Text style={styles.content}>
          {content}
        </Text>
        {date && <Text style={styles.date}>{date}</Text>}
      </View>
    </Page>
  </Document>
);
