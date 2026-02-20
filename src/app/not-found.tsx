"use client";

import { useState } from "react";
import styled from "styled-components";

const Wrapper = styled.main`
  min-height: 100vh;
  padding: 1rem;
  display: grid;
`;

const Terminal = styled.section`
  width: min(1100px, 100%);
  min-height: calc(100vh - 2rem);
  margin: 0 auto;
  border: 1px solid #1f6f2a;
  background: #000000;
  display: grid;
  grid-template-rows: auto auto 1fr;
`;

const Header = styled.div`
  border-bottom: 1px solid #1f6f2a;
  color: #72ff87;
  padding: 0.7rem 1rem;
  font-size: 0.95rem;
`;

const Output = styled.pre`
  margin: 0;
  padding: 1rem;
  color: #72ff87;
  font-family: inherit;
  white-space: pre-wrap;
  word-break: break-word;
`;

const Input = styled.textarea`
  width: 100%;
  height: 100%;
  resize: none;
  border: 0;
  border-top: 1px solid #1f6f2a;
  outline: none;
  background: #000000;
  color: #72ff87;
  padding: 1rem;
  font: inherit;
  line-height: 1.5;
`;

const initialText = [
  "system@console:~$ open /missing-route",
  "[error] 404 not found",
  "[hint] go back to /",
  "",
  "user@console:~$ ",
].join("\n");

export default function NotFound() {
  const [text, setText] = useState("");

  return (
    <Wrapper>
      <Terminal>
        <Header>retro-console</Header>
        <Output>{initialText}</Output>
        <Input
          aria-label="retro console input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          spellCheck={false}
          autoFocus
        />
      </Terminal>
    </Wrapper>
  );
}