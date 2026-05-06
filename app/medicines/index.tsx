import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import MedicineRow from '@/components/MedicineRow';
import { useDeleteMedicine, useMedicines } from '@/lib/queries';
import { useTheme } from '@/lib/themeStore';

export default function MedicinesScreen() {
  const router = useRouter();
  const { tokens } = useTheme();

  const medsQ = useMedicines();
  const deleteMed = useDeleteMedicine();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDelId, setConfirmDelId] = useState<string | null>(null);

  const meds = medsQ.data ?? [];

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)' as Href);
  };

  const handleAdd = () => {
    router.push('/medicines/add' as Href);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelId) return;
    try {
      await deleteMed.mutateAsync(confirmDelId);
    } finally {
      setConfirmDelId(null);
      setExpandedId(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: tokens.bg }}>
      <StatusBar style="light" />

      <LinearGradient
        colors={tokens.header.colors}
        start={tokens.header.start}
        end={tokens.header.end}
        style={{ paddingTop: 44, paddingBottom: 16, paddingHorizontal: 18 }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 9,
            marginBottom: 8,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={handleBack}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 8,
              padding: 6,
            }}
          >
            <ArrowLeft size={18} color="white" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 21, fontWeight: '900', color: 'white' }}>
              My Medicines
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: 'white',
                opacity: 0.8,
                marginTop: 1,
              }}
            >
              {meds.length} saved
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add medicine manually"
          onPress={handleAdd}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 11,
            paddingVertical: 9,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>
            + Add Manually
          </Text>
        </Pressable>
      </LinearGradient>

      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 13, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={medsQ.isFetching}
              onRefresh={() => {
                medsQ.refetch();
              }}
            />
          }
        >
          {medsQ.isLoading ? (
            <View
              style={{
                paddingVertical: 48,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ActivityIndicator size="large" color="#0D9488" />
            </View>
          ) : meds.length === 0 ? (
            <View
              style={{
                paddingVertical: 56,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 48, marginBottom: 10 }}>💊</Text>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: '800',
                  color: tokens.text,
                  marginBottom: 4,
                }}
              >
                No medicines yet
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: tokens.text2,
                  fontWeight: '600',
                }}
              >
                Tap + Add Manually above
              </Text>
            </View>
          ) : (
            meds.map((med) => (
              <MedicineRow
                key={med.id}
                med={med}
                isExpanded={expandedId === med.id}
                onToggle={() =>
                  setExpandedId((prev) => (prev === med.id ? null : med.id))
                }
                onDelete={() => setConfirmDelId(med.id)}
                onEdit={() => router.push(`/medicines/edit/${med.id}` as Href)}
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={confirmDelId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmDelId(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.55)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: tokens.card,
              borderRadius: 18,
              padding: 22,
              maxWidth: 340,
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 42, marginBottom: 8 }}>🗑️</Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '800',
                color: tokens.text,
                marginBottom: 7,
                textAlign: 'center',
              }}
            >
              Remove Medicine?
            </Text>
            <Text
              style={{
                color: tokens.text2,
                fontSize: 14,
                marginBottom: 18,
                textAlign: 'center',
              }}
            >
              This medicine will be removed from your schedule.
            </Text>
            <View style={{ flexDirection: 'row', gap: 9, width: '100%' }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel removal"
                onPress={() => setConfirmDelId(null)}
                disabled={deleteMed.isPending}
                style={{
                  flex: 1,
                  backgroundColor: tokens.card2,
                  borderRadius: 11,
                  paddingVertical: 11,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontWeight: '700',
                    fontSize: 15,
                    color: tokens.text2,
                  }}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Confirm remove medicine"
                onPress={handleConfirmDelete}
                disabled={deleteMed.isPending}
                style={{
                  flex: 1,
                  backgroundColor: '#EF4444',
                  borderRadius: 11,
                  paddingVertical: 11,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 6,
                  opacity: deleteMed.isPending ? 0.7 : 1,
                }}
              >
                {deleteMed.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : null}
                <Text
                  style={{
                    fontWeight: '700',
                    fontSize: 15,
                    color: 'white',
                  }}
                >
                  Remove
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
