"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
  grid-template-rows: auto auto 1fr auto;
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

const HintBar = styled.div`
  border-top: 1px solid #1f6f2a;
  border-bottom: 1px solid #1f6f2a;
  padding: 0.75rem 1rem;
  color: #72ff87;
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
`;

const ToolLink = styled(Link)`
  color: #b0ffbe;
  text-decoration: underline;
`;

const Input = styled.textarea`
  width: 100%;
  height: 100%;
  resize: none;
  border: 0;
  outline: none;
  background: #000000;
  color: #72ff87;
  padding: 1rem;
  font: inherit;
  line-height: 1.5;
`;

const Footer = styled.div`
  border-top: 1px solid #1f6f2a;
  padding: 0.6rem 1rem;
  color: #72ff87;
`;

const initialText = [
  "system@console:~$ boot",
  "[ok] retro console ready",
  "[info] type anything and press Enter",
  "[info] commands are not executed",
  "",
  "user@console:~$ ",
].join("\n");

export default function Home() {
  const [text, setText] = useState("");

  const lines = useMemo(() => text.split("\n").length, [text]);

  return (
    <Wrapper>
      <Terminal>
        <Header>retro-console</Header>
        <Output>{initialText}</Output>
        <HintBar>
          <span>[suggested] /tools/estimativos</span>
          <ToolLink href="/tools/estimativos">open /tools/estimativos</ToolLink>
        </HintBar>
        <Input
          aria-label="retro console input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          spellCheck={false}
          autoFocus
        />
        <Footer>{`lines: ${lines}`}</Footer>
      </Terminal>
    </Wrapper>
  );
}