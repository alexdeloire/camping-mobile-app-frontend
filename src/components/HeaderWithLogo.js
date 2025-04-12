import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import logo from '../../assets/logo1.png';

const HeaderWithLogo = ({ title }) => {
    return (
        <View style={styles.container}>
            <Image source={logo} style={styles.logo} />
            <Text style={styles.title}>{title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%', 
    },
    logo: {
        width: 130,  
        height: 40,
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'black',
        flex: 1, 
        textAlign: 'right', 
    },
});

export default HeaderWithLogo;
