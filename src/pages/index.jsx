import Head from "next/head";
import Image from "next/image";
import styles from "../../styles/Home.module.css";
import styled from "styled-components";
import axios from "axios";
import { useState, useEffect } from "react";

export const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 80px calc(100vh - 80px);
  grid-template-areas:
    "header"
    "main";
  background-color: #373b3e;
`;

export const Header = styled.div`
  grid-area: header;
  background-color: #004480;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
`;

export const Main = styled.div`
  grid-area: main;
`;

export async function getServerSideProps(context) {
  // const data = await axios({
  //   method: "post",
  //   url: "http://localhost:5002/",
  //   data: {
  //     firstName: "Finn",
  //     lastName: "Williams",
  //   },
  // });

  const { data } = await axios({
    method: "get",
    url: "http://localhost:5002/",
  });

  return {
    props: {
      data: data,
    },
  };
}

export default function Home(data) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const done = async () => {
      setItems(data.data);
    };
    done();
  }, []);

  return (
    <Container>
      {console.log(items)}
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header></Header>
      <Main>
        {items.map((item, key) => {
          return (
            <div key={key}>
              <div>{item.word}</div>
              <div>{item.meaning}</div>
            </div>
          );
        })}
      </Main>
    </Container>
  );
}
