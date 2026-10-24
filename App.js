import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  RefreshControl,
} from 'react-native';
import { Ionicons, Feather, Octicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

// Güncel ve Resmi Coin Logoları
const COIN_LOGOS = {
  usdt: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
  bnb: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  btc: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  eth: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  sol: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  trx: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
  usdc: 'https://assets.coingecko.com/coins/images/6319/large/usdc.png',
  arbitrum: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
  base: 'https://assets.coingecko.com/coins/images/31338/large/base.png',
};

export default function App() {
  // Kilit Ekranı Durum Yönetimi
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState('');
  const CORRECT_PIN = '120620';

  // Ana Ekran Durum Yönetimi
  const [activeTab, setActiveTab] = useState('Coin');
  const [activeNav, setActiveNav] = useState('Cüzdan');
  const [showBalance, setShowBalance] = useState(true);
  const [usdtBalance, setUsdtBalance] = useState(78000);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inputBalance, setInputBalance] = useState('');

  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Numpad Tuş Basma İşlemi
  const handleKeyPress = (num) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 6) {
        if (newPin === CORRECT_PIN) {
          setTimeout(() => {
            setIsLocked(false);
            setPin('');
          }, 150);
        } else {
          setTimeout(() => {
            Alert.alert('Hata', 'Yanlış şifre girdiniz!');
            setPin('');
          }, 200);
        }
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  // CoinGecko Canlı Veri Çekme
  const fetchPrices = async () => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=tether,binancecoin,bitcoin,ethereum,solana,tron,usd-coin&vs_currencies=usd&include_24hr_change=true'
      );
      const data = await res.json();

      const usdt = data.tether || { usd: 1.00, usd_24h_change: 0.00 };
      const bnb = data.binancecoin || { usd: 720.50, usd_24h_change: -3.59 };
      const btc = data.bitcoin || { usd: 79692.00, usd_24h_change: -2.30 };
      const eth = data.ethereum || { usd: 2302.49, usd_24h_change: -4.20 };
      const sol = data.solana || { usd: 180.25, usd_24h_change: 1.45 };
      const trx = data.tron || { usd: 0.16, usd_24h_change: 0.85 };
      const usdc = data['usd-coin'] || { usd: 1.00, usd_24h_change: 0.01 };

      setCoins([
        {
          id: 'usdt',
          name: 'USDT (Tether)',
          price: usdt.usd,
          change: usdt.usd_24h_change,
          logo: COIN_LOGOS.usdt,
          amount: showBalance ? usdtBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '****',
          usdValue: showBalance ? `$${usdtBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$****',
        },
        {
          id: 'bnb',
          name: 'BNB (BEP20)',
          price: bnb.usd,
          change: bnb.usd_24h_change,
          logo: COIN_LOGOS.bnb,
          amount: '0',
          usdValue: '$0',
        },
        {
          id: 'btc',
          name: 'BTC (Bitcoin)',
          price: btc.usd,
          change: btc.usd_24h_change,
          logo: COIN_LOGOS.btc,
          amount: '0',
          usdValue: '$0',
        },
        {
          id: 'sol',
          name: 'SOL (Solana)',
          price: sol.usd,
          change: sol.usd_24h_change,
          logo: COIN_LOGOS.sol,
          amount: '0',
          usdValue: '$0',
        },
        {
          id: 'trx',
          name: 'TRX (TRON)',
          price: trx.usd,
          change: trx.usd_24h_change,
          logo: COIN_LOGOS.trx,
          amount: '0',
          usdValue: '$0',
        },
        {
          id: 'usdc',
          name: 'USDC (USD Coin)',
          price: usdc.usd,
          change: usdc.usd_24h_change,
          logo: COIN_LOGOS.usdc,
          amount: '0',
          usdValue: '$0',
        },
        {
          id: 'eth-erc20',
          name: 'ETH (ERC20)',
          price: eth.usd,
          change: eth.usd_24h_change,
          logo: COIN_LOGOS.eth,
          amount: '0',
          usdValue: '$0',
        },
        {
          id: 'eth-arb',
          name: 'ETH (Arbitrum)',
          price: eth.usd,
          change: eth.usd_24h_change,
          logo: COIN_LOGOS.arbitrum,
          amount: '0',
          usdValue: '$0',
        },
        {
          id: 'eth-base',
          name: 'ETH (Base)',
          price: eth.usd,
          change: eth.usd_24h_change,
          logo: COIN_LOGOS.base,
          amount: '0',
          usdValue: '$0',
        },
      ]);
    } catch (e) {
      console.log('API Error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [usdtBalance, showBalance]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPrices();
  };

  const handleSaveBalance = () => {
    const val = parseFloat(inputBalance);
    if (!isNaN(val) && val >= 0) {
      setUsdtBalance(val);
      setIsModalVisible(false);
      setInputBalance('');
    } else {
      Alert.alert('Hata', 'Lütfen geçerli bir bakiye tutarı girin.');
    }
  };

  const filteredCoins = coins.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const btcPrice = coins.find((c) => c.id === 'btc')?.price || 79692;
  const btcEquivalent = (usdtBalance / btcPrice).toFixed(6);

  // 1. KİLİT EKRANI (ŞİFRE GİRİŞİ)
  if (isLocked) {
    return (
      <SafeAreaView style={styles.lockContainer}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={styles.lockHeader}>
          <Text style={styles.lockTitle}>Tekrar hoş geldiniz!</Text>
          <Text style={styles.lockSubtitle}>
            SafePal Uygulamasının kilidini şifre ile açma
          </Text>

          <View style={styles.pinBoxesRow}>
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <View key={idx} style={styles.pinBox}>
                  {isFilled && <View style={styles.pinDot} />}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.numpadContainer}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
          ].map((row, rIdx) => (
            <View key={rIdx} style={styles.numpadRow}>
              {row.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.numButton}
                  onPress={() => handleKeyPress(item)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.numText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          <View style={styles.numpadRow}>
            <View style={styles.numButtonEmpty} />
            <TouchableOpacity
              style={styles.numButton}
              onPress={() => handleKeyPress('0')}
              activeOpacity={0.6}
            >
              <Text style={styles.numText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.numButton}
              onPress={handleDelete}
              activeOpacity={0.6}
            >
              <Feather name="delete" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 2. ANA CÜZDAN EKRANI
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Üst Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => setIsLocked(true)}>
              <Octicons name="gear" size={19} color="#E4E4E7" />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 16 }}>
              <Ionicons name="notifications-outline" size={21} color="#E4E4E7" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.walletTitleContainer}>
            <Text style={styles.walletTitle}>Wallet01-1CY</Text>
            <Ionicons name="chevron-down" size={14} color="#A1A1AA" style={{ marginLeft: 4 }} />
            <Ionicons name="copy-outline" size={13} color="#A1A1AA" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <TouchableOpacity>
            <Ionicons name="scan-outline" size={21} color="#E4E4E7" />
          </TouchableOpacity>
        </View>

        {/* Sekmeler (Coin, Earn, NFT) */}
        <View style={styles.tabContainer}>
          {['Coin', 'Earn', 'NFT'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Kaydırılabilir İçerik */}
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00E676"
              colors={['#00E676']}
            />
          }
        >
          {/* Bakiye Alanı */}
          <View style={styles.balanceSection}>
            <Text style={styles.balanceTitle}>Bakiye</Text>
            <TouchableOpacity
              style={styles.balanceValueRow}
              onPress={() => setIsModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.balanceAmount}>
                {showBalance
                  ? `$${usdtBalance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : '****'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowBalance(!showBalance)}
                style={{ marginLeft: 8, padding: 2 }}
              >
                <Ionicons
                  name={showBalance ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color="#A1A1AA"
                />
              </TouchableOpacity>
            </TouchableOpacity>
            <Text style={styles.btcSubText}>
              {showBalance ? `${btcEquivalent} BTC` : '**** BTC'}
            </Text>
          </View>

          {/* GÖNDER / AL / SATIN AL / GAS İSTASYONU / DAHA BUTONLARI */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionCircle}>
                <Feather name="arrow-up" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>Gönder</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionCircle}>
                <Feather name="arrow-down" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>Al</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionCircle}>
                <Feather name="credit-card" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>Satın Al</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionCircle}>
                <MaterialCommunityIcons name="gas-station-outline" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel} numberOfLines={1}>Gas İstasy...</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionCircle}>
                <Feather name="more-horizontal" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>Daha</Text>
            </TouchableOpacity>
          </View>

          {/* Arama & Filtreleme Barı */}
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={16} color="#71717A" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Ara"
                placeholderTextColor="#71717A"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <TouchableOpacity style={styles.filterDropdown}>
              <Text style={styles.filterText}>Tümü</Text>
              <Ionicons name="chevron-down" size={14} color="#A1A1AA" style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.moreButton}>
              <Feather name="more-vertical" size={18} color="#A1A1AA" />
            </TouchableOpacity>
          </View>

          {/* Coin Listesi */}
          {loading && !refreshing ? (
            <ActivityIndicator size="small" color="#7C4DFF" style={{ marginTop: 30 }} />
          ) : (
            <View style={styles.coinListCard}>
              {filteredCoins.map((coin, index) => (
                <View
                  key={coin.id}
                  style={[
                    styles.coinRow,
                    index === filteredCoins.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={styles.coinLeft}>
                    <Image source={{ uri: coin.logo }} style={styles.coinLogoImage} />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.coinNameText}>{coin.name}</Text>
                      <View style={styles.coinPriceRow}>
                        <Text style={styles.coinPriceText}>
                          ${coin.price ? coin.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                        </Text>
                        <Text
                          style={[
                            styles.coinChangeText,
                            { color: coin.change < 0 ? '#EF4444' : '#10B981' },
                          ]}
                        >
                          {coin.change ? `${coin.change.toFixed(2)}%` : '0.00%'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.coinRight}>
                    <Text style={styles.coinAmountText}>{coin.amount}</Text>
                    <Text style={styles.coinUsdText}>{coin.usdValue}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Güvenlik Testi Kartı */}
          <View style={styles.securityCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#E4E4E7" />
              <Text style={styles.securityTitle}>Güvenlik Testi</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="close" size={18} color="#71717A" />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* SafePal Alt Navigasyon Çubuğu */}
        <View style={styles.bottomTabBar}>
          <TouchableOpacity
            style={styles.navTabItem}
            onPress={() => setActiveNav('Cüzdan')}
          >
            <View style={styles.walletIconBox}>
              <FontAwesome5
                name="wallet"
                size={16}
                color={activeNav === 'Cüzdan' ? '#00E676' : '#71717A'}
              />
            </View>
            <Text
              style={[
                styles.navTabText,
                activeNav === 'Cüzdan' && styles.navTabTextActive,
              ]}
            >
              Cüzdan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navTabItem}
            onPress={() => setActiveNav('Eşleştir')}
          >
            <Feather
              name="bar-chart-2"
              size={20}
              color={activeNav === 'Eşleştir' ? '#00E676' : '#71717A'}
            />
            <Text
              style={[
                styles.navTabText,
                activeNav === 'Eşleştir' && styles.navTabTextActive,
              ]}
            >
              Eşleştir
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navTabItem}
            onPress={() => setActiveNav('Keşfedin')}
          >
            <Feather
              name="grid"
              size={20}
              color={activeNav === 'Keşfedin' ? '#00E676' : '#71717A'}
            />
            <Text
              style={[
                styles.navTabText,
                activeNav === 'Keşfedin' && styles.navTabTextActive,
              ]}
            >
              Keşfedin
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navTabItem}
            onPress={() => setActiveNav('Takas')}
          >
            <Feather
              name="repeat"
              size={20}
              color={activeNav === 'Takas' ? '#00E676' : '#71717A'}
            />
            <Text
              style={[
                styles.navTabText,
                activeNav === 'Takas' && styles.navTabTextActive,
              ]}
            >
              Takas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navTabItem}
            onPress={() => setActiveNav('Sat')}
          >
            <Feather
              name="dollar-sign"
              size={20}
              color={activeNav === 'Sat' ? '#00E676' : '#71717A'}
            />
            <Text
              style={[
                styles.navTabText,
                activeNav === 'Sat' && styles.navTabTextActive,
              ]}
            >
              Sat
            </Text>
          </TouchableOpacity>
        </View>

        {/* USDT Bakiye Güncelleme Modalı */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalBox}>
              <Text style={styles.modalHeaderTitle}>USDT Bakiye Güncelle</Text>
              <TextInput
                style={styles.modalTextInput}
                keyboardType="numeric"
                placeholder="Örn: 78000"
                placeholderTextColor="#71717A"
                value={inputBalance}
                onChangeText={setInputBalance}
                autoFocus
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnCancel]}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.modalBtnText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnConfirm]}
                  onPress={handleSaveBalance}
                >
                  <Text style={styles.modalBtnConfirmText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // KİLİT EKRANI STİLLERİ
  lockContainer: {
    flex: 1,
    backgroundColor: '#121216',
    justifyContent: 'space-between',
    paddingTop: STATUS_BAR_HEIGHT + 40,
    paddingBottom: 20,
  },
  lockHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  lockTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  lockSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
  },
  pinBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  pinBox: {
    width: 44,
    height: 48,
    borderWidth: 1,
    borderColor: '#3F3F46',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  numpadContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  numpadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  numButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#27272A',
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numButtonEmpty: {
    flex: 1,
    height: 52,
    marginHorizontal: 5,
  },
  numText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
  },

  // ANA EKRAN STİLLERİ
  safeArea: {
    flex: 1,
    backgroundColor: '#121216',
  },
  header: {
    paddingTop: STATUS_BAR_HEIGHT + 8,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#121216',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#22222A',
  },
  tabItem: {
    marginRight: 28,
    paddingVertical: 10,
    position: 'relative',
  },
  tabText: {
    color: '#A1A1AA',
    fontSize: 15,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#6366F1',
    borderRadius: 1,
  },
  contentScroll: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  balanceSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceTitle: {
    color: '#A1A1AA',
    fontSize: 13,
    marginBottom: 6,
  },
  balanceValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  btcSubText: {
    color: '#A1A1AA',
    fontSize: 13,
    marginTop: 4,
  },

  // İŞLEM BUTONLARI STİLLERİ (GÖNDER / AL / SATIN AL...)
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  actionItem: {
    alignItems: 'center',
    width: (width - 48) / 5,
  },
  actionCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#24242C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    color: '#E4E4E7',
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E24',
    height: 38,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E24',
    height: 38,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  filterText: {
    color: '#E4E4E7',
    fontSize: 13,
  },
  moreButton: {
    backgroundColor: '#1E1E24',
    height: 38,
    width: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  coinListCard: {
    backgroundColor: '#1C1C22',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#24242C',
  },
  coinLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinLogoImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  coinNameText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  coinPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinPriceText: {
    color: '#A1A1AA',
    fontSize: 12,
    marginRight: 6,
  },
  coinChangeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  coinRight: {
    alignItems: 'flex-end',
  },
  coinAmountText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  coinUsdText: {
    color: '#A1A1AA',
    fontSize: 12,
    marginTop: 2,
  },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C22',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 16,
  },
  securityTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  bottomTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#121216',
    borderTopWidth: 1,
    borderTopColor: '#22222A',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 12 : 24,
  },
  navTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  walletIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTabText: {
    color: '#71717A',
    fontSize: 10,
    marginTop: 3,
  },
  navTabTextActive: {
    color: '#00E676',
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    width: width * 0.85,
    backgroundColor: '#1C1C22',
    borderRadius: 14,
    padding: 20,
  },
  modalHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalTextInput: {
    backgroundColor: '#121216',
    color: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBtn: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#27272A',
  },
  modalBtnConfirm: {
    backgroundColor: '#00E676',
  },
  modalBtnText: {
    color: '#E4E4E7',
    fontSize: 14,
    fontWeight: '500',
  },
  modalBtnConfirmText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
});
