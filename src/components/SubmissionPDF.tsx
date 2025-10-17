import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// 나눔고딕 폰트는 기본 제공되지 않으므로 기본 폰트 사용
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#6366f1',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 3,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 5,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  content: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#1e293b',
    marginBottom: 3,
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 3,
  },
  moodTag: {
    backgroundColor: '#f1f5f9',
    padding: 4,
    borderRadius: 3,
    fontSize: 8,
    color: '#475569',
  },
  storySection: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  storySectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  subContent: {
    fontSize: 8,
    lineHeight: 1.4,
    color: '#475569',
    marginLeft: 8,
    marginBottom: 3,
  },
  label: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 2,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  column: {
    flex: 1,
  },
});

interface SubmissionPDFProps {
  submission: {
    student_name: string;
    game_title: string;
    protagonist_name: string;
    protagonist_traits: string;
    story_background: string;
    mood: string[];
    mood_custom: string | null;
    story_start: string;
    story_middle: string;
    choice_1: string;
    choice_2: string;
    happy_ending: string;
    sad_ending: string;
    created_at: string;
  };
}

export const SubmissionPDF = ({ submission }: SubmissionPDFProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{submission.game_title}</Text>
          <Text style={styles.subtitle}>Author: {submission.student_name}</Text>
          <Text style={styles.subtitle}>Date: {formatDate(submission.created_at)}</Text>
        </View>

        {/* Protagonist */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Protagonist</Text>
          <Text style={styles.content}>{submission.protagonist_name}</Text>
          {submission.protagonist_traits && (
            <Text style={styles.subContent}>{submission.protagonist_traits}</Text>
          )}
        </View>

        {/* Story Background */}
        {submission.story_background && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Story Background</Text>
            <Text style={styles.content}>{submission.story_background}</Text>
          </View>
        )}

        {/* Mood */}
        {(submission.mood.length > 0 || submission.mood_custom) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mood</Text>
            <View style={styles.moodContainer}>
              {submission.mood.map((m, idx) => (
                <Text key={idx} style={styles.moodTag}>{m}</Text>
              ))}
              {submission.mood_custom && (
                <Text style={styles.moodTag}>{submission.mood_custom}</Text>
              )}
            </View>
          </View>
        )}

        {/* Story Flow */}
        <View style={styles.storySection}>
          <Text style={styles.storySectionTitle}>Story Flow</Text>
          
          {/* Beginning */}
          {submission.story_start && (
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.label}>Beginning</Text>
              <Text style={styles.subContent}>{submission.story_start}</Text>
            </View>
          )}

          {/* Middle */}
          {submission.story_middle && (
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.label}>Middle</Text>
              <Text style={styles.subContent}>{submission.story_middle}</Text>
            </View>
          )}

          {/* Choices */}
          {(submission.choice_1 || submission.choice_2) && (
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.label}>Choices</Text>
              {submission.choice_1 && (
                <Text style={styles.subContent}>Choice 1: {submission.choice_1}</Text>
              )}
              {submission.choice_2 && (
                <Text style={styles.subContent}>Choice 2: {submission.choice_2}</Text>
              )}
            </View>
          )}

          {/* Endings */}
          {(submission.happy_ending || submission.sad_ending) && (
            <View style={styles.twoColumn}>
              {submission.happy_ending && (
                <View style={styles.column}>
                  <Text style={styles.label}>Happy Ending</Text>
                  <Text style={styles.subContent}>{submission.happy_ending}</Text>
                </View>
              )}
              {submission.sad_ending && (
                <View style={styles.column}>
                  <Text style={styles.label}>Sad Ending</Text>
                  <Text style={styles.subContent}>{submission.sad_ending}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};
