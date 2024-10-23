import React, { useContext, useState, useEffect } from "react";
import { Text, View, TouchableOpacity, Image, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { validateEmail } from "../../Utils";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FloatingLabelInput } from "../../Components/FloatingInputLabel";
import { LoadingIndicator } from "../../Components/LoadingIndicator";
import { useNavigationHandler } from "../../Hooks/navigation";
import styles from "./styles";

type RootStackParamList = {
  BottomTab: undefined;
  SignUp: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BottomTab'
>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

export default function Login() {
  const navigate = useNavigationHandler();

  const [isSubmiting, setSubmiting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [validation, setValidation] = useState({
    email: "",
    password: "",
    msg: ""
  });

  async function onLoginPress() {
    setSubmiting(true);
    var email = form.email.trim();
    var password = form.password.trim();

    var hasError = false;
    var validations: { [key: string]: string } = {};


    if (!password) {
      hasError = true;
      validations["password"] = "Campo obrigatório";
    };

    if (!email) {
      hasError = true;
      validations["email"] = "Campo obrigatório";
    } else {
      if (!validateEmail(email)) {
        hasError = true;
        validations["email"] = "E-mail inválido";
      }
    }

    if (hasError) {
      setSubmiting(false);
      return setValidation({
        email: validations["email"] || "",
        password: validations["password"] || "",
        msg: ""
      });
    }
  }

  useEffect(() => {
    setValidation({
      email: "",
      password: "",
      msg: ""
    })
  }, [form]);
  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

        <KeyboardAvoidingView
          style={styles.scroll}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          enabled
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

            <View style={styles.containerFormLogin}>
              <View>
                <Text style={styles.h1}>Login</Text>
              </View>

              <View style={!!validation?.email ? styles.inputError : styles.input}>
                <FloatingLabelInput
                  label="E-mail"
                  text={form.email}
                  value={form.email}
                  returnKeyType="next"
                  autoCapitalize={"none"}
                  keyboardType={"email-address"}
                  onChangeText={(email: string) => setForm({ ...form, email })}
                />
              </View>

              {!validation?.email && (
                <Text style={styles.validation}>{validation?.email}</Text>
              )}

              <View style={!!validation?.password ? styles.inputError : styles.input}>
                <FloatingLabelInput
                  label="Senha"
                  secureText={true}
                  text={form.password}
                  value={form.password}
                  returnKeyType="send"
                  autoCapitalize={"none"}
                  onChangeText={(password: string) => setForm({ ...form, password })}
                />
              </View>


              {!validation?.password && (
                <Text style={styles.validation}>{validation?.password}</Text>
              )}

              {!validation.msg && (
                <Text style={styles.validation}>{validation?.msg}</Text>
              )}

              <TouchableOpacity
                style={styles.submitButton}
                disabled={isSubmiting}
                onPress={() => navigate.navigate("VoiceAssistant")}
              // onPress={onLoginPress}

              >
                <LoadingIndicator isLoading={isSubmiting} />
                {!isSubmiting && <Text style={styles.submitText}>Entrar</Text>}
              </TouchableOpacity>

              <Text style={styles.textFirst}>
                Ainda não é cadastrado?
              </Text>

              <TouchableOpacity
                style={styles.seccondButton}
                onPress={() => navigate.navigate("Home")}
              >
                <Text style={styles.textSeccond}>Cadastre-se agora</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};