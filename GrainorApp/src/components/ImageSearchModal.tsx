/**
 * 7.1 Recherche d'image — Wikimedia Commons (API publique, sans clé) + lien Google Images.
 * L'image choisie est persistée localement (via le store).
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from './Icon';
import { colors, fonts, radius } from '../theme/tokens';

interface WikiResult {
  thumb: string;
  full: string;
}

async function searchWikimedia(query: string): Promise<WikiResult[]> {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=' +
    encodeURIComponent(query) +
    '&gsrlimit=18&prop=imageinfo&iiprop=url|mime&iiurlwidth=320&format=json&origin=*';
  const res = await fetch(url);
  const j = await res.json();
  const pages = j.query && j.query.pages ? Object.keys(j.query.pages).map((k: string) => j.query.pages[k]) : [];
  return pages
    .map((p: any) => {
      const ii = p.imageinfo && p.imageinfo[0];
      if (!ii) return null;
      if (ii.mime && !/^image\/(jpeg|png|gif|webp)/.test(ii.mime)) return null;
      return { thumb: ii.thumburl || ii.url, full: ii.url } as WikiResult;
    })
    .filter(Boolean) as WikiResult[];
}

export function ImageSearchModal({
  visible,
  initialQuery,
  onClose,
  onPick,
}: {
  visible: boolean;
  initialQuery: string;
  onClose: () => void;
  onPick: (url: string) => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<WikiResult[]>([]);

  const run = useCallback(async (q: string) => {
    const term = q.trim();
    if (!term) return;
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const res = await searchWikimedia(term);
      setResults(res);
      setError(res.length ? '' : 'Aucune image trouvée pour cette recherche.');
    } catch {
      setError('Recherche indisponible (connexion).');
    } finally {
      setLoading(false);
    }
  }, []);

  // À l'ouverture : pré-remplir avec le nom latin et lancer une recherche.
  useEffect(() => {
    if (visible) {
      setQuery(initialQuery);
      setResults([]);
      setError('');
      run(initialQuery);
    }
  }, [visible, initialQuery, run]);

  const googleUrl = 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(query.trim());

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headRow}>
            <Text style={styles.headTitle}>Trouver une image</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Icon name="close" size={15} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Nom de la plante…"
              placeholderTextColor={colors.textFaint}
              style={styles.input}
              onSubmitEditing={() => run(query)}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={() => run(query)} activeOpacity={0.8}>
              <Text style={styles.searchBtnText}>Chercher</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Wikimedia Commons · licences libres</Text>
            <TouchableOpacity onPress={() => Linking.openURL(googleUrl)} activeOpacity={0.7}>
              <Text style={styles.googleLink}>Google Images ↗</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
            {loading && <ActivityIndicator color={colors.primary} style={{ width: '100%', marginTop: 30 }} />}
            {!loading && !!error && <Text style={styles.error}>{error}</Text>}
            {results.map((r, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.8}
                onPress={() => onPick(r.full)}
                style={styles.cell}
              >
                <Image source={{ uri: r.thumb }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const GAP = 8;
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(30,26,20,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#F4EEE2',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '84%',
    paddingTop: 16,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  headTitle: { fontFamily: fonts.serif, fontSize: 19, color: colors.text },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingBottom: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: radius.field,
    paddingVertical: 11,
    paddingHorizontal: 13,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surfaceInput,
  },
  searchBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.field,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchBtnText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.onPrimary },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  metaText: { fontFamily: fonts.sans, fontSize: 11, color: colors.textFaint },
  googleLink: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.primaryDim },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 22,
  },
  cell: {
    width: '32%',
    aspectRatio: 1,
    marginBottom: GAP,
    borderRadius: radius.field,
    overflow: 'hidden',
    backgroundColor: colors.trackAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  error: { width: '100%', textAlign: 'center', paddingVertical: 24, color: '#BC6A43', fontFamily: fonts.sans, fontSize: 13 },
});
