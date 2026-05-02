import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SCREEN_HEIGHT = Dimensions.get('window').height;

type Props = {
  testID: string;
  label: string;
  value: string;
  options: string[];
  onSelect: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
};

export default function DropdownPicker({ testID, label, value, options, onSelect, placeholder, disabled, loading }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = search ? options.filter(o => o.toLowerCase().includes(search.toLowerCase())) : options;
  const maxItems = Math.min(filtered.length, 6);
  const listHeight = options.length > 8 ? (maxItems * 44) + 50 : maxItems * 44;

  return (
    <View style={s.container}>
      <TouchableOpacity testID={testID} style={[s.trigger, disabled && s.triggerOff, open && s.triggerOpen]}
        onPress={() => { if (!disabled) { setOpen(!open); setSearch(''); } }} activeOpacity={0.7}>
        <Text style={[s.triggerText, !value && s.placeholder]} numberOfLines={1}>
          {loading ? 'Loading...' : value || placeholder}
        </Text>
        <MaterialCommunityIcons name={open ? "chevron-up" : "chevron-down"} size={16} color={disabled ? '#333' : '#E62020'} />
      </TouchableOpacity>

      {open && (
        <View style={[s.dropdown, { maxHeight: listHeight + 8 }]}>  
          {options.length > 8 && (
            <TextInput testID={`${testID}-search`} style={s.searchInput} placeholder="Search..."
              placeholderTextColor="#555" value={search} onChangeText={setSearch} autoFocus />
          )}
          <FlatList
            data={filtered}
            keyExtractor={item => item}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            renderItem={({ item }) => (
              <TouchableOpacity testID={`${testID}-opt-${item}`}
                style={[s.option, item === value && s.optionActive]}
                onPress={() => { onSelect(item); setOpen(false); setSearch(''); }}>
                <Text style={[s.optionText, item === value && s.optionTextActive]} numberOfLines={1}>{item}</Text>
                {item === value && <MaterialCommunityIcons name="check" size={14} color="#E62020" />}
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={s.empty}>No results</Text>}
          />
        </View>
      )}

      {open && <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={() => { setOpen(false); setSearch(''); }} />}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, zIndex: 100 },
  trigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 13 },
  triggerOff: { opacity: 0.4 },
  triggerOpen: { borderColor: '#E62020', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  triggerText: { fontSize: 14, color: '#FFF', flex: 1, marginRight: 4 },
  placeholder: { color: '#555' },
  dropdown: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#1A1A1A', borderWidth: 1, borderTopWidth: 0, borderColor: '#E62020', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, zIndex: 999, elevation: 10, overflow: 'hidden' },
  searchInput: { backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#2A2A2A', color: '#FFF', fontSize: 13, paddingHorizontal: 12, paddingVertical: 8 },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#222' },
  optionActive: { backgroundColor: '#2A1010' },
  optionText: { fontSize: 13, color: '#CCC', flex: 1 },
  optionTextActive: { color: '#E62020', fontWeight: '700' },
  empty: { color: '#555', textAlign: 'center', paddingVertical: 12, fontSize: 13 },
  backdrop: { position: 'fixed' as any, top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 },
});
