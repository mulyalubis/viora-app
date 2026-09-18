import { router } from "expo-router";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

const { width, height } = Dimensions.get('window');

const customModeConfig = {
  parallaxScrollingScale: 0.75,
  parallaxScrollingOffset: 110,
};

const data = [
  { id: 1, title: "Lavojoy", image: require("../../assets/images/lavojoy.jpg"), },
  { id: 2, title: "OMG", image: require("../../assets/images/fix-and-lock.jpg"), },
  { id: 3, title: "Skindose", image: require("../../assets/images/skindose.jpg"), },
];

const CARD_WIDTH = width * 1;
const CARD_HEIGHT = Math.min(height * 0.67, 550);

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>VIORA</Text>
      <View style={{
        position: "relative",
      }}>
        <Text style={styles.subtitle}>Beautify yourself with the best touch from</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/product")}>
          <Text style={{ color: "#fff", }}>Best Product</Text>
        </TouchableOpacity>
      </View>
      <View>
        <Carousel
          loop
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          style={{
            width: width,
            justifyContent: 'center',
            marginTop: -(height * 0.045),
          }}
          autoPlay={true}
          autoPlayInterval={3000}
          scrollAnimationDuration={2000}
          mode="parallax"
          modeConfig={customModeConfig}
          data={data}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <Image
                source={item.image}
                style={styles.image}
              />
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: height * 0.08,
    alignItems: "center",
    backgroundColor: "#E3DFD3",
  },
  cardContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'white',
    // Shadow untuk iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    // Shadow untuk Android
    elevation: 8,
  },
  button: {
    position: "absolute",
    alignSelf: "center",
    bottom: 7,
    backgroundColor: '#92A390',
    padding: 10,
    borderRadius: 10,
    zIndex: 10,
  },
  title: {
    fontSize: width * 0.15,
    color: "#92A390",
  },
  subtitle: {
    fontSize: width * 0.13,
    color: "#000",
    paddingHorizontal: 20,
    marginTop: 5,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});


