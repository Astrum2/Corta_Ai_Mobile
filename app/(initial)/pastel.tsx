import { ProfilePicture } from "@/components/profile-picture";
import { H1 } from "@/components/text";
import { useTheme } from "@/contexts/theme";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

type Pessoa = {
  nome: string;
  idade: number;
  fotoURL: string;
}

const joao: Pessoa = {
  nome: "João",
  idade: 90,
  fotoURL: "https://avatars.githubusercontent.com/u/106830297?v=4"
}

const pedro: Pessoa = {
  nome: "Pedro",
  idade: 23,
  fotoURL: "https://s2-ge.glbimg.com/PZSI3bS8HNZrEk_sTb3KmScg3IQ=/1920x0/filters:format(jpeg)/https://i.s3.glbimg.com/v1/AUTH_bc8228b6673f488aa253bbcb03c80ec5/internal_photos/bs/2025/y/s/EtLVJBQKCLKkovgELPkA/thumbnail-dur-3636.jpg"
}

const max: Pessoa = {
  nome: "Maxwell",
  idade: 29,
  fotoURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Dwayne_Johnson_at_the_2009_Tribeca_Film_Festival.jpg/250px-Dwayne_Johnson_at_the_2009_Tribeca_Film_Festival.jpg"
}

const pessoas: Pessoa[] = [
  joao,
  pedro,
  max
]

export default function Pastel() {
  const [pessoa, setPessoa] = useState<Pessoa | null>(null);
  const { toggleTheme, theme, space } = useTheme()
  const router = useRouter()

  const gerarPessoaAleatoria = () => {
    const randomIndice = Math.floor(Math.random() * pessoas.length)
    const pessoa = pessoas[randomIndice]
    setPessoa(pessoa)
  }

  useEffect(() => {
    gerarPessoaAleatoria()
  }, [])


  return (
    <View
      style={
        [
          styles.container,
          {
            backgroundColor: theme.bodyBg,
            padding: space[6],
            gap: space[2]
          }]
      }
    >
      <ProfilePicture
        fotoUrl={pessoa?.fotoURL ?? ""}
      />

      <H1>Pastel na mao</H1>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }
})