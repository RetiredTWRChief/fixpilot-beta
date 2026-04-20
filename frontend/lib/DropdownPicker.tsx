import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, StyleSheet, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

  return (
    <View style={s.container}>
      <TouchableOpacity testID={testID} style={[s.trigger, disabled && s.triggerDisabled]}
        onPress={() => !disabled && setOpen(true)} activeOpacity={0.7}>
        <Text style={[s.triggerText, !value && s.placeholder]} numberOfLines={1}>
          {loading ? 'Loading...' : value || placeholder}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={18} color={disabled ? '#333' : '#E62020'} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={s.overlay}>
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{label}</Text>
              <TouchableOpacity testID={`${testID}-close`} onPress={() => { setOpen(false); setSearch(''); }}>
                <MaterialCommunityIcons name="close" size={22} color="#999" />
              </TouchableOpacity>
            </View>
            {options.length > 8 && (
              <TextInput testID={`${testID}-search`} style={s.searchInput} placeholder="Search..."
                placeholderTextColor="#555" value={search} onChangeText={setSearch} autoFocus />
            )}
            <FlatList
              data={filtered}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity testID={`${testID}-option-${item}`} style={[s.option, item === value && s.optionActive]}
                  onPress={() => { onSelect(item); setOpen(false); setSearch(''); }}>
                  <Text style={[s.optionText, item === value && s.optionTextActive]}>{item}</Text>
                  {item === value && <MaterialCommunityIcons name="check" size={18} color="#E62020" />}
                </TouchableOpacity>
              )}
              style={s.list}
              ListEmptyComponent={<Text style={s.empty}>No options found</Text>}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  trigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 13 },
  triggerDisabled: { opacity: 0.4 },
  triggerText: { fontSize: 15, color: '#FFF', flex: 1, marginRight: 8 },
  placeholder: { color: '#555' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#1A1A1A', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '70%', paddingBottom: 30 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  searchInput: { backgroundColor: '#111', borderWidth: 1, borderColor: '#333', borderRadius: 8, color: '#FFF', fontSize: 15, paddingHorizontal: 14, paddingVertical: 10, marginHorizontal: 16, marginTop: 10 },
  list: { paddingHorizontal: 8 },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#222' },
  optionActive: { backgroundColor: '#2A1010' },
  optionText: { fontSize: 15, color: '#CCC' },
  optionTextActive: { color: '#E62020', fontWeight: '700' },
  empty: { color: '#555', textAlign: 'center', paddingVertical: 20, fontSize: 14 },
});
