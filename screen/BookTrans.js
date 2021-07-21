import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, TextInput, Image, KeyboardAvoidingView, ToastAndroid, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import db from '../config';
import * as firebase from 'firebase'
import { BarCodeScanner } from 'expo-barcode-scanner';

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId: '',
        buttonState: 'normal',
        transactionMessage: '',
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }
    handleTransaction = async()=>{
      var transactionmessage 
      db.collection("Books").doc(this.state.scannedBookId).get().then((doc) => {
        var book = doc.data()
        if(book.BookAvailability){
          this.initiateBookIssue()
          transactionmessage = "Book Issued"
          ToastAndroid.show(transactionmessage,ToastAndroid.SHORT)
        }else{
          this.initiateBookReturn()
          transactionmessage = "Book Returned"
          ToastAndroid.show(transactionmessage,ToastAndroid.SHORT)
        }
      })
      this.setState({
        transactionMessage: transactionmessage,
      })
    }
    initiateBookIssue = async()=>{
      db.collection("Transaction").add({
        'studentId' : this.state.scannedStudentId,
        'bookId' : this.state.scannedBookId,
        'date': firebase.firestore.Timestamp.now().toDate(),
        'transactionType':"Issue"
      })
      db.collection("Books").doc(this.state.scannedBookId).update({
        'BookAvailability' : false
      })
      db.collection("Students").doc(this.state.scannedStudentId).update({
        'numberOfBooksIssued': firebase.firestore.FieldValue.increment(1)
    })
    this.setState({
      scannedStudentId: '',
      scannedBookId: '',
    })
    }
    initiateBookReturn = async()=>{
      db.collection("Transaction").add({
        'studentId' : this.state.scannedStudentId,
        'bookId' : this.state.scannedBookId,
        'date': firebase.firestore.Timestamp.now().toDate(),
        'transactionType':"Return"
      })
      db.collection("Books").doc(this.state.scannedBookId).update({
        'BookAvailability' : true
      })
      db.collection("Students").doc(this.state.scannedStudentId).update({
        'numberOfBooksIssued': firebase.firestore.FieldValue.increment(-1)
    })
    this.setState({
      scannedStudentId: '',
      scannedBookId: '',
    })
    }
    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state
      if(buttonState === 'BookId'){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }else if (buttonState === 'StudentId'){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
    }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView style = {styles.container} behavior = "padding" enabled>
          <View>
            <View>
              <Image source = {require('../assets/booklogo.jpg')}
              style = {{width: 200, height:200}}
              />
              <Text style = {{textAlign: 'center', fontSize: 30}}>Library App</Text>
              </View>
              <View style = {styles.inputView}>
              <TextInput style = {styles.inputBox} placeholder = 'BookId' 
              value = {this.state.scannedBookId} onChangeText = {text => this.setState({scannedBookId:text})}></TextInput>
              <TouchableOpacity style = {styles.scanButton}
              onPress = {
                ()=>{
                  this.getCameraPermissions('BookId')
                }
              }
              >
                <Text style = {styles.buttonText}> Scan </Text>
              </TouchableOpacity>
              </View>
              <View style = {styles.inputView}>
              <TextInput style = {styles.inputBox} placeholder = 'StudentId' 
              value = {this.state.scannedStudentId} onChangeText = {text => this.setState({scannedStudentId:text})}></TextInput>
              <TouchableOpacity style = {styles.scanButton}
                onPress = {
                  ()=>{
                    this.getCameraPermissions('StudentId')
                  }
                }>
                <Text style = {styles.buttonText}> Scan </Text>
              </TouchableOpacity>
              </View>
              <TouchableOpacity style = {styles.submitBtn} onPress ={ async()=>{
                    var transactionMessage = this.handleTransaction
                    this.setState({
                      scannedBookId: '',
                      scannedStudentId: '',
                    })
                  }
              }>
                
                <Text style = {styles.submitBtnText}>Submit</Text>
              </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },

    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitBtn: {
      backgroundColor: 'aqua',
      width: 100,
      height: 50,
    },
    submitBtnText: {
      padding: 10,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white'
    }
  });