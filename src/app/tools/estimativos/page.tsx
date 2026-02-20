"use client";

import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

type Expense = {
  id: string;
  name: string;
  value: number;
  sign: "+" | "-";
};

type Calc = {
  id: string;
  name: string;
  leftExpenseId: string;
  op: "+" | "-";
  rightExpenseId: string;
};

type MonthState = {
  expenses: Expense[];
  calcs: Calc[];
};

type Account = {
  id: string;
  name: string;
  balanceUyu: number;
};

type CalendarCell = {
  key: string;
  dateNumber: number;
  inMonth: boolean;
};

const MONTH_COUNT = 18;
const WEEK_DAYS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

const Page = styled.main`
  min-height: 100vh;
  background: #000;
  color: #72ff87;
  padding: 1rem;
`;

const Shell = styled.div`
  width: min(1400px, 100%);
  margin: 0 auto;
  border: 1px solid #1f6f2a;
  background: #000;
`;

const Top = styled.section`
  border-bottom: 1px solid #1f6f2a;
  padding: 1rem;
  display: grid;
  gap: 0.8rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1rem;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

const Card = styled.div`
  border: 1px solid #1f6f2a;
  padding: 0.7rem;
  min-width: 230px;
  flex: 1;
`;

const Input = styled.input`
  width: 100%;
  background: #000;
  color: #72ff87;
  border: 1px solid #1f6f2a;
  padding: 0.45rem;
  font: inherit;
`;

const Select = styled.select`
  width: 100%;
  background: #000;
  color: #72ff87;
  border: 1px solid #1f6f2a;
  padding: 0.45rem;
  font: inherit;
`;

const Button = styled.button`
  background: #000;
  color: #72ff87;
  border: 1px solid #1f6f2a;
  padding: 0.4rem 0.7rem;
  font: inherit;
  cursor: pointer;
`;

const Months = styled.section`
  padding: 1rem;
  display: grid;
  gap: 1rem;
`;

const MonthWrap = styled.article`
  border: 1px solid #1f6f2a;
  display: grid;
  grid-template-columns: 2.3fr 1fr;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const MonthMain = styled.div`
  border-right: 1px solid #1f6f2a;
  padding: 0.8rem;

  @media (max-width: 980px) {
    border-right: 0;
    border-bottom: 1px solid #1f6f2a;
  }
`;

const MonthSide = styled.div`
  padding: 0.8rem;
  display: grid;
  gap: 0.7rem;
`;

const MonthTitle = styled.h2`
  margin: 0 0 0.6rem;
  font-size: 0.96rem;
`;

const WeekHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(36px, 1fr));
  gap: 0.35rem;
  margin-bottom: 0.35rem;
`;

const WeekDay = styled.div`
  border: 1px solid #1f6f2a;
  text-align: center;
  padding: 0.25rem;
  font-size: 0.8rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(36px, 1fr));
  gap: 0.35rem;
`;

const Cell = styled.div<{ $active: boolean; $faded: boolean }>`
  border: 1px solid ${({ $active }) => ($active ? "#72ff87" : "#1f6f2a")};
  opacity: ${({ $faded }) => ($faded ? 0.5 : 1)};
  background: #000;
  min-height: 74px;
  padding: 0.25rem;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 0.25rem;
  cursor: pointer;
`;

const CellDate = styled.div`
  font-size: 0.75rem;
`;

const CellInput = styled.input`
  width: 100%;
  border: 1px solid #1f6f2a;
  background: #000;
  color: #72ff87;
  font: inherit;
  padding: 0.25rem;
`;

const Small = styled.div`
  font-size: 0.78rem;
`;

const Divider = styled.div`
  border-top: 1px solid #1f6f2a;
  margin: 0.35rem 0;
`;

const Table = styled.div`
  display: grid;
  gap: 0.4rem;
`;

const Three = styled.div`
  display: grid;
  gap: 0.4rem;
  grid-template-columns: 1.5fr 0.8fr 0.9fr;
`;

const Four = styled.div`
  display: grid;
  gap: 0.4rem;
  grid-template-columns: 1fr 0.8fr 0.8fr 0.9fr;
`;

const Result = styled.div`
  border: 1px solid #1f6f2a;
  padding: 0.5rem;
  font-size: 0.82rem;
`;

function dateKey(year: number, monthIndex: number, day: number) {
  const m = String(monthIndex + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function monthKey(year: number, monthIndex: number) {
  const m = String(monthIndex + 1).padStart(2, "0");
  return `${year}-${m}`;
}

function getMonthLabel(year: number, monthIndex: number) {
  const date = new Date(year, monthIndex, 1);
  return date.toLocaleDateString("es-UY", { month: "long", year: "numeric" });
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function getMondayIndex(jsDay: number) {
  return (jsDay + 6) % 7;
}

function buildMonthCells(year: number, monthIndex: number): CalendarCell[] {
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const lead = getMondayIndex(firstDay);
  const daysCurrent = getDaysInMonth(year, monthIndex);

  const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
  const prevMonthYear = monthIndex === 0 ? year - 1 : year;
  const prevDays = getDaysInMonth(prevMonthYear, prevMonthIndex);

  const cells: CalendarCell[] = [];

  for (let i = lead - 1; i >= 0; i -= 1) {
    const day = prevDays - i;
    cells.push({
      key: dateKey(prevMonthYear, prevMonthIndex, day),
      dateNumber: day,
      inMonth: false,
    });
  }

  for (let day = 1; day <= daysCurrent; day += 1) {
    cells.push({
      key: dateKey(year, monthIndex, day),
      dateNumber: day,
      inMonth: true,
    });
  }

  const needed = Math.ceil(cells.length / 7) * 7;
  const nextMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1;
  const nextMonthYear = monthIndex === 11 ? year + 1 : year;
  let nextDay = 1;

  while (cells.length < needed) {
    cells.push({
      key: dateKey(nextMonthYear, nextMonthIndex, nextDay),
      dateNumber: nextDay,
      inMonth: false,
    });
    nextDay += 1;
  }

  return cells;
}

function getMonthSequence(count: number) {
  const start = new Date();
  const months: { year: number; monthIndex: number; key: string; label: string }[] = [];

  for (let i = 0; i < count; i += 1) {
    const date = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const year = date.getFullYear();
    const monthIndex = date.getMonth();
    months.push({
      year,
      monthIndex,
      key: monthKey(year, monthIndex),
      label: getMonthLabel(year, monthIndex),
    });
  }

  return months;
}

function newExpense(): Expense {
  return { id: `e-${Math.random().toString(36).slice(2, 10)}`, name: "", value: 0, sign: "-" };
}

function newCalc(): Calc {
  return {
    id: `c-${Math.random().toString(36).slice(2, 10)}`,
    name: "",
    leftExpenseId: "",
    op: "+",
    rightExpenseId: "",
  };
}

function ensureMonthState(state: Record<string, MonthState>, key: string): MonthState {
  return state[key] ?? { expenses: [newExpense()], calcs: [] };
}

export default function EstimativosPage() {
  const months = useMemo(() => getMonthSequence(MONTH_COUNT), []);

  const [dayValues, setDayValues] = useState<Record<string, string>>({});
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [monthData, setMonthData] = useState<Record<string, MonthState>>({});
  const [accounts, setAccounts] = useState<Account[]>([
    { id: "a1", name: "Cuenta 1", balanceUyu: 0 },
    { id: "a2", name: "Cuenta 2", balanceUyu: 0 },
    { id: "a3", name: "Cuenta 3", balanceUyu: 0 },
  ]);
  const [uyuPerUsd, setUyuPerUsd] = useState<number | null>(null);
  const [rateLabel, setRateLabel] = useState("cargando...");

  useEffect(() => {
    let active = true;

    async function loadRate() {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
        const data = await res.json();
        const rate = Number(data?.rates?.UYU);
        if (!active) {
          return;
        }
        if (Number.isFinite(rate) && rate > 0) {
          setUyuPerUsd(rate);
          setRateLabel(`1 USD = ${rate.toFixed(2)} UYU`);
        } else {
          setRateLabel("sin tasa disponible");
        }
      } catch {
        if (active) {
          setRateLabel("sin conexion para tasa USD/UYU");
        }
      }
    }

    loadRate();
    return () => {
      active = false;
    };
  }, []);

  const selectedSet = useMemo(() => new Set(selectedDates), [selectedDates]);

  const accountTotalUyu = accounts.reduce((sum, a) => sum + (Number.isFinite(a.balanceUyu) ? a.balanceUyu : 0), 0);
  const accountTotalUsd = uyuPerUsd ? accountTotalUyu / uyuPerUsd : 0;

  function toggleDate(key: string) {
    setSelectedDates((prev) => {
      if (prev.includes(key)) {
        return prev.filter((x) => x !== key);
      }
      return [...prev, key];
    });
  }

  function setCellValue(key: string, value: string) {
    if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
      setDayValues((prev) => ({ ...prev, [key]: value }));
    }
  }

  function updateMonthData(month: string, updater: (current: MonthState) => MonthState) {
    setMonthData((prev) => {
      const current = ensureMonthState(prev, month);
      return { ...prev, [month]: updater(current) };
    });
  }

  function getSelectedSumForMonth(month: string) {
    return selectedDates.reduce((sum, key) => {
      if (!key.startsWith(month)) {
        return sum;
      }
      const value = Number(dayValues[key]);
      return Number.isFinite(value) ? sum + value : sum;
    }, 0);
  }

  function getMonthNet(month: string) {
    const state = ensureMonthState(monthData, month);
    const expensesNet = state.expenses.reduce((sum, item) => {
      const val = Number(item.value) || 0;
      return item.sign === "+" ? sum + val : sum - val;
    }, 0);

    const byId = new Map(state.expenses.map((e) => [e.id, e.value]));
    const calcNet = state.calcs.reduce((sum, c) => {
      const left = Number(byId.get(c.leftExpenseId) ?? 0);
      const right = Number(byId.get(c.rightExpenseId) ?? 0);
      const result = c.op === "+" ? left + right : left - right;
      return sum + result;
    }, 0);

    return expensesNet + calcNet;
  }

  return (
    <Page>
      <Shell>
        <Top>
          <Title>estimativos@console: herramienta /tools/estimativos</Title>
          <Row>
            <Card>
              <Small>Tipo de cambio USD/UYU (actual)</Small>
              <Small>{rateLabel}</Small>
            </Card>
            <Card>
              <Small>Total en cuentas</Small>
              <Small>{`UYU ${accountTotalUyu.toFixed(2)}`}</Small>
              <Small>{uyuPerUsd ? `USD ${accountTotalUsd.toFixed(2)}` : "USD -"}</Small>
            </Card>
          </Row>
          <Card>
            <Small>Estados de cuenta</Small>
            <Table>
              {accounts.map((account) => (
                <Three key={account.id}>
                  <Input
                    value={account.name}
                    onChange={(event) => {
                      const name = event.target.value;
                      setAccounts((prev) => prev.map((a) => (a.id === account.id ? { ...a, name } : a)));
                    }}
                    placeholder="Cuenta"
                  />
                  <Input
                    type="number"
                    value={account.balanceUyu}
                    onChange={(event) => {
                      const balanceUyu = Number(event.target.value || 0);
                      setAccounts((prev) => prev.map((a) => (a.id === account.id ? { ...a, balanceUyu } : a)));
                    }}
                    placeholder="UYU"
                  />
                  <Button
                    onClick={() => {
                      setAccounts((prev) => prev.filter((a) => a.id !== account.id));
                    }}
                  >
                    eliminar
                  </Button>
                </Three>
              ))}
            </Table>
            <Button
              onClick={() => {
                setAccounts((prev) => [
                  ...prev,
                  { id: `a-${Math.random().toString(36).slice(2, 10)}`, name: `Cuenta ${prev.length + 1}`, balanceUyu: 0 },
                ]);
              }}
            >
              + agregar cuenta
            </Button>
          </Card>
        </Top>

        <Months>
          {months.map((month, idx) => {
            const state = ensureMonthState(monthData, month.key);
            const cells = buildMonthCells(month.year, month.monthIndex);
            const selectedSum = getSelectedSumForMonth(month.key);
            const net = getMonthNet(month.key);
            const savingProjectionUyu = accountTotalUyu + net;
            const savingProjectionUsd = uyuPerUsd ? savingProjectionUyu / uyuPerUsd : 0;

            return (
              <MonthWrap key={month.key}>
                <MonthMain>
                  <MonthTitle>{month.label}</MonthTitle>
                  <WeekHeader>
                    {WEEK_DAYS.map((d) => (
                      <WeekDay key={`${month.key}-${d}`}>{d}</WeekDay>
                    ))}
                  </WeekHeader>
                  <Grid>
                    {cells.map((cell) => (
                      <Cell
                        key={cell.key}
                        $active={selectedSet.has(cell.key)}
                        $faded={!cell.inMonth}
                        onClick={() => toggleDate(cell.key)}
                      >
                        <CellDate>{cell.dateNumber}</CellDate>
                        <CellInput
                          value={dayValues[cell.key] ?? ""}
                          onChange={(event) => setCellValue(cell.key, event.target.value)}
                          onClick={(event) => event.stopPropagation()}
                          placeholder="0"
                        />
                      </Cell>
                    ))}
                  </Grid>
                  <Small>{`seleccionados en ${month.key}: ${selectedSum.toFixed(2)}`}</Small>
                  {idx < months.length - 1 ? <Small>{`siguiente -> ${months[idx + 1].label}`}</Small> : null}
                </MonthMain>

                <MonthSide>
                  <Small>Gastos / resultados</Small>
                  <Table>
                    {state.expenses.map((expense) => (
                      <Four key={expense.id}>
                        <Input
                          value={expense.name}
                          onChange={(event) => {
                            const name = event.target.value;
                            updateMonthData(month.key, (current) => ({
                              ...current,
                              expenses: current.expenses.map((e) => (e.id === expense.id ? { ...e, name } : e)),
                            }));
                          }}
                          placeholder="nombre"
                        />
                        <Input
                          type="number"
                          value={expense.value}
                          onChange={(event) => {
                            const value = Number(event.target.value || 0);
                            updateMonthData(month.key, (current) => ({
                              ...current,
                              expenses: current.expenses.map((e) => (e.id === expense.id ? { ...e, value } : e)),
                            }));
                          }}
                          placeholder="valor"
                        />
                        <Select
                          value={expense.sign}
                          onChange={(event) => {
                            const sign = event.target.value as "+" | "-";
                            updateMonthData(month.key, (current) => ({
                              ...current,
                              expenses: current.expenses.map((e) => (e.id === expense.id ? { ...e, sign } : e)),
                            }));
                          }}
                        >
                          <option value="-">restar</option>
                          <option value="+">sumar</option>
                        </Select>
                        <Button
                          onClick={() => {
                            updateMonthData(month.key, (current) => ({
                              ...current,
                              expenses: current.expenses.map((e) =>
                                e.id === expense.id ? { ...e, value: Number(selectedSum.toFixed(2)) } : e,
                              ),
                            }));
                          }}
                        >
                          usar seleccion
                        </Button>
                      </Four>
                    ))}
                  </Table>

                  <Row>
                    <Button
                      onClick={() => {
                        updateMonthData(month.key, (current) => ({
                          ...current,
                          expenses: [...current.expenses, newExpense()],
                        }));
                      }}
                    >
                      + gasto
                    </Button>
                  </Row>

                  <Divider />

                  <Small>Operaciones con nombre (resultado)</Small>
                  <Table>
                    {state.calcs.map((calc) => (
                      <Table key={calc.id}>
                        <Input
                          value={calc.name}
                          onChange={(event) => {
                            const name = event.target.value;
                            updateMonthData(month.key, (current) => ({
                              ...current,
                              calcs: current.calcs.map((c) => (c.id === calc.id ? { ...c, name } : c)),
                            }));
                          }}
                          placeholder="nombre resultado"
                        />
                        <Four>
                          <Select
                            value={calc.leftExpenseId}
                            onChange={(event) => {
                              const leftExpenseId = event.target.value;
                              updateMonthData(month.key, (current) => ({
                                ...current,
                                calcs: current.calcs.map((c) => (c.id === calc.id ? { ...c, leftExpenseId } : c)),
                              }));
                            }}
                          >
                            <option value="">gasto A</option>
                            {state.expenses.map((e) => (
                              <option key={`${calc.id}-l-${e.id}`} value={e.id}>
                                {e.name || "(sin nombre)"}
                              </option>
                            ))}
                          </Select>
                          <Select
                            value={calc.op}
                            onChange={(event) => {
                              const op = event.target.value as "+" | "-";
                              updateMonthData(month.key, (current) => ({
                                ...current,
                                calcs: current.calcs.map((c) => (c.id === calc.id ? { ...c, op } : c)),
                              }));
                            }}
                          >
                            <option value="+">+</option>
                            <option value="-">-</option>
                          </Select>
                          <Select
                            value={calc.rightExpenseId}
                            onChange={(event) => {
                              const rightExpenseId = event.target.value;
                              updateMonthData(month.key, (current) => ({
                                ...current,
                                calcs: current.calcs.map((c) => (c.id === calc.id ? { ...c, rightExpenseId } : c)),
                              }));
                            }}
                          >
                            <option value="">gasto B</option>
                            {state.expenses.map((e) => (
                              <option key={`${calc.id}-r-${e.id}`} value={e.id}>
                                {e.name || "(sin nombre)"}
                              </option>
                            ))}
                          </Select>
                          <Button
                            onClick={() => {
                              updateMonthData(month.key, (current) => ({
                                ...current,
                                calcs: current.calcs.filter((c) => c.id !== calc.id),
                              }));
                            }}
                          >
                            eliminar
                          </Button>
                        </Four>
                        <Result>
                          {(() => {
                            const byId = new Map(state.expenses.map((e) => [e.id, e.value]));
                            const left = Number(byId.get(calc.leftExpenseId) ?? 0);
                            const right = Number(byId.get(calc.rightExpenseId) ?? 0);
                            const value = calc.op === "+" ? left + right : left - right;
                            return `${calc.name || "resultado"}: ${value.toFixed(2)}`;
                          })()}
                        </Result>
                      </Table>
                    ))}
                  </Table>

                  <Row>
                    <Button
                      onClick={() => {
                        updateMonthData(month.key, (current) => ({
                          ...current,
                          calcs: [...current.calcs, newCalc()],
                        }));
                      }}
                    >
                      + resultado
                    </Button>
                  </Row>

                  <Divider />

                  <Result>{`neto mes: ${net.toFixed(2)} UYU`}</Result>
                  <Result>{`saldo proyectado (cuentas + neto): ${savingProjectionUyu.toFixed(2)} UYU`}</Result>
                  <Result>{uyuPerUsd ? `saldo proyectado: ${savingProjectionUsd.toFixed(2)} USD` : "saldo proyectado USD: -"}</Result>
                </MonthSide>
              </MonthWrap>
            );
          })}
        </Months>
      </Shell>
    </Page>
  );
}