import { useMemo, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import Svg, { ClipPath, Path, Image as SvgImage } from "react-native-svg";

const width = Dimensions.get("window").width;

export default function BannerCarousel() {
    const [activeIndex, setActiveIndex] = useState(0);

    const data = useMemo(() => [
        require("../assets/images/lavojoy.jpg"),
        require("../assets/images/skindose.jpg"),
        require("../assets/images/fix-and-lock.jpg"),
        require("../assets/images/magia.jpg"),
        require("../assets/images/dazzle-me.jpg"),
    ], []);

    const modeConfig = useMemo(() => ({
        snapDirection: 'left' as const,
        moveSize: 0,
        stackInterval: 18,
        scaleInterval: 0.5,
        rotateZDeg: 0,
        opacityInterval: 0.5,
    }), []);

    return (
        <View>
            <Carousel
                loop
                width={width}
                height={200}
                autoPlay={true}
                style={{
                    justifyContent: 'center',
                }}
                data={data}
                mode="horizontal-stack"
                snapEnabled={true}
                pagingEnabled={true}
                modeConfig={modeConfig}
                autoPlayInterval={3500}
                scrollAnimationDuration={500}
                onSnapToItem={(index) => setActiveIndex(index)}
                defaultIndex={0}
                renderItem={({ item }) => (
                    <View style={{ width: width - 40, marginTop: 20, alignSelf: "center" }}>

                        <View style={{ width: width - 40, height: 190 }}>

                            <Svg width="100%" height="100%" viewBox="0 0 390 200">

                                <ClipPath id="clip">
                                    <Path d="M380.5 0.5H10.5C4.97715 0.5 0.5 4.97715 0.5 10.5V182.5C0.5 188.023 4.97715 192.5 10.5 192.5H123.228C126.474 192.5 129.518 190.925 131.392 188.275L154.769 155.225C156.644 152.575 159.688 151 162.933 151H228.537C231.813 151 234.881 152.604 236.75 155.295L259.613 188.205C261.482 190.896 264.55 192.5 267.826 192.5H380.5C386.023 192.5 390.5 188.023 390.5 182.5V10.5C390.5 4.97715 386.023 0.5 380.5 0.5Z" />
                                </ClipPath>

                                <SvgImage
                                    href={item}
                                    width="100%"
                                    height="100%"
                                    clipPath="url(#clip)"
                                    preserveAspectRatio="xMidYMid slice"
                                />

                            </Svg>

                        </View>

                    </View>
                )}
            />
            <View style={styles.dotsContainer}>
                {data.map((_, index) => (
                    <View
                        key={index}
                        style={{
                            width: activeIndex === index ? 16 : 8,
                            height: 8,
                            backgroundColor: activeIndex === index ? "black" : "#ccc",
                            borderRadius: 10,
                            margin: 3
                        }}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    dotsContainer: {
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bottom: 0,
        height: 30,
        alignSelf: "center",
        flexDirection: "row",
        backgroundColor: "white",
        paddingHorizontal: 2,
        borderRadius: 20,
    },
});