"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

type Expense = {
  id: string;
  name: string;
  value: number;
  mode: "+" | "-";
};

type MonthResult = {
  id: string;
  name: string;
  value: number;
};

type MonthState = {
  expenses: Expense[];
  results: MonthResult[];
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

type MenuState = {
  visible: boolean;
  kind: "cells" | "expenses";
  monthKey: string;
  x: number;
  y: number;
};

const MONTH_COUNT = 18;
const WEEK_DAYS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

const Page = styled.main`
  min-height: 100vh;
  background: #ffffff;
  color: #202124;
  padding: 1rem;
`;

const Shell = styled.div`
  width: min(1500px, 100%);
  margin: 0 auto;
  border: 1px solid #dadce0;
  background: #ffffff;
`;

const Top = styled.section`
  border-bottom: 1px solid #dadce0;
  padding: 0.9rem;
  display: grid;
  gap: 0.8rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1rem;
`;

const Row = styled.div`
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
`;

const Card = styled.div`
  border: 1px solid #dadce0;
  padding: 0.65rem;
  min-width: 220px;
  flex: 1;
`;

const Small = styled.div`
  font-size: 0.8rem;
`;

const Input = styled.input`
  width: 100%;
  background: #ffffff;
  color: #202124;
  border: 1px solid #dadce0;
  padding: 0.4rem;
  font: inherit;

  &:focus {
    outline: 2px solid #1a73e8;
    outline-offset: -1px;
    border-color: #1a73e8;
  }
`;

const Select = styled.select`
  width: 100%;
  background: #ffffff;
  color: #202124;
  border: 1px solid #dadce0;
  padding: 0.4rem;
  font: inherit;
`;

const Button = styled.button`
  background: #ffffff;
  color: #202124;
  border: 1px solid #dadce0;
  padding: 0.36rem 0.6rem;
  font: inherit;
  cursor: pointer;

  &:hover {
    background: #f1f3f4;
  }
`;

const Months = styled.section`
  padding: 0.9rem;
  display: grid;
  gap: 0.9rem;
`;

const MonthWrap = styled.article`
  border: 1px solid #dadce0;
  display: grid;
  grid-template-columns: 2.2fr 1.2fr;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const MonthMain = styled.div`
  border-right: 1px solid #dadce0;
  padding: 0.8rem;

  @media (max-width: 1100px) {
    border-right: 0;
    border-bottom: 1px solid #dadce0;
  }
`;

const MonthSide = styled.div`
  padding: 0.8rem;
  display: grid;
  gap: 0.6rem;
`;

const MonthTitle = styled.h2`
  margin: 0 0 0.55rem;
  font-size: 0.95rem;
`;

const WeekHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(35px, 1fr));
  gap: 0.3rem;
  margin-bottom: 0.3rem;
`;

const WeekDay = styled.div`
  border: 1px solid #dadce0;
  background: #f8f9fa;
  text-align: center;
  padding: 0.22rem;
  font-size: 0.75rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(35px, 1fr));
  gap: 0.3rem;
`;

const Cell = styled.div<{ $active: boolean; $faded: boolean }>`
  min-height: 72px;
  border: 1px solid ${({ $active }) => ($active ? "#1a73e8" : "#dadce0")};
  background: ${({ $active, $faded }) => ($active ? "#e8f0fe" : $faded ? "#f8f9fa" : "#fff")};
  opacity: 1;
  padding: 0.2rem;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 0.2rem;
  cursor: cell;
  user-select: none;
`;

const CellDate = styled.div`
  font-size: 0.75rem;
`;

const CellInput = styled.input`
  width: 100%;
  background: #ffffff;
  color: #202124;
  border: 1px solid #dadce0;
  font: inherit;
  padding: 0.22rem;
`;

const Divider = styled.div`
  border-top: 1px solid #dadce0;
`;

const ExpenseHead = styled.div`
  display: grid;
  gap: 0.3rem;
  grid-template-columns: 1.3fr 0.8fr 0.7fr;
`;

const ExpenseRow = styled.div<{ $selected: boolean }>`
  display: grid;
  gap: 0.3rem;
  grid-template-columns: 1.3fr 0.8fr 0.7fr;
  border: 1px solid ${({ $selected }) => ($selected ? "#1a73e8" : "transparent")};
  background: ${({ $selected }) => ($selected ? "#e8f0fe" : "#fff")};
  padding: 0.2rem;
  user-select: none;
`;

const ResultBox = styled.div`
  border: 1px solid #dadce0;
  padding: 0.5rem;
  font-size: 0.8rem;
  background: #fff;
`;

const Menu = styled.div`
  position: fixed;
  z-index: 80;
  min-width: 290px;
  border: 1px solid #dadce0;
  background: #ffffff;
  padding: 0.55rem;
  display: grid;
  gap: 0.45rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.14);
`;

function dateKey(year: number, monthIndex: number, day: number) {
  const m = String(monthIndex + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function monthKey(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function getMondayIndex(jsDay: number) {
  return (jsDay + 6) % 7;
}

function getMonthLabel(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1).toLocaleDateString("es-UY", {
    month: "long",
    year: "numeric",
  });
}

function buildMonthCells(year: number, monthIndex: number): CalendarCell[] {
  const first = new Date(year, monthIndex, 1).getDay();
  const lead = getMondayIndex(first);
  const days = getDaysInMonth(year, monthIndex);

  const prevM = monthIndex === 0 ? 11 : monthIndex - 1;
  const prevY = monthIndex === 0 ? year - 1 : year;
  const prevDays = getDaysInMonth(prevY, prevM);

  const cells: CalendarCell[] = [];
  for (let i = lead - 1; i >= 0; i -= 1) {
    const day = prevDays - i;
    cells.push({ key: dateKey(prevY, prevM, day), dateNumber: day, inMonth: false });
  }

  for (let day = 1; day <= days; day += 1) {
    cells.push({ key: dateKey(year, monthIndex, day), dateNumber: day, inMonth: true });
  }

  const needed = Math.ceil(cells.length / 7) * 7;
  const nextM = monthIndex === 11 ? 0 : monthIndex + 1;
  const nextY = monthIndex === 11 ? year + 1 : year;
  let nextDay = 1;
  while (cells.length < needed) {
    cells.push({ key: dateKey(nextY, nextM, nextDay), dateNumber: nextDay, inMonth: false });
    nextDay += 1;
  }

  return cells;
}

function monthSequence(count: number) {
  const base = new Date();
  return Array.from({ length: count }).map((_, i) => {
    const date = new Date(base.getFullYear(), base.getMonth() + i, 1);
    const year = date.getFullYear();
    const monthIndex = date.getMonth();
    return {
      year,
      monthIndex,
      key: monthKey(year, monthIndex),
      label: getMonthLabel(year, monthIndex),
    };
  });
}

function makeExpense(): Expense {
  return {
    id: `e-${Math.random().toString(36).slice(2, 10)}`,
    name: "",
    value: 0,
    mode: "-",
  };
}

function ensureMonth(state: Record<string, MonthState>, key: string): MonthState {
  return state[key] ?? { expenses: [makeExpense()], results: [] };
}

export default function EstimativosPage() {
  const months = useMemo(() => monthSequence(MONTH_COUNT), []);

  const [dayValues, setDayValues] = useState<Record<string, string>>({});
  const [monthData, setMonthData] = useState<Record<string, MonthState>>({});

  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<Record<string, string[]>>({});

  const [accounts, setAccounts] = useState<Account[]>([
    { id: "a1", name: "Cuenta 1", balanceUyu: 0 },
    { id: "a2", name: "Cuenta 2", balanceUyu: 0 },
    { id: "a3", name: "Cuenta 3", balanceUyu: 0 },
  ]);

  const [uyuPerUsd, setUyuPerUsd] = useState<number | null>(null);
  const [rateLabel, setRateLabel] = useState("cargando...");

  const [menu, setMenu] = useState<MenuState>({
    visible: false,
    kind: "cells",
    monthKey: "",
    x: 0,
    y: 0,
  });

  const [newExpenseName, setNewExpenseName] = useState("");
  const [bulkValue, setBulkValue] = useState(0);
  const [newResultName, setNewResultName] = useState("");

  const menuRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const expenseDraggingRef = useRef<{ active: boolean; monthKey: string }>({ active: false, monthKey: "" });

  useEffect(() => {
    function up() {
      draggingRef.current = false;
      expenseDraggingRef.current.active = false;
    }
    function closeMenu(ev: MouseEvent) {
      if (menuRef.current && ev.target instanceof Node && !menuRef.current.contains(ev.target)) {
        setMenu((prev) => ({ ...prev, visible: false }));
      }
    }
    function closeMenuFromContext(ev: MouseEvent) {
      if (menuRef.current && ev.target instanceof Node && !menuRef.current.contains(ev.target)) {
        setMenu((prev) => ({ ...prev, visible: false }));
      }
    }
    window.addEventListener("mouseup", up);
    window.addEventListener("mousedown", closeMenu, true);
    window.addEventListener("contextmenu", closeMenuFromContext, true);
    return () => {
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mousedown", closeMenu, true);
      window.removeEventListener("contextmenu", closeMenuFromContext, true);
    };
  }, []);

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

  const selectedCellSet = useMemo(() => new Set(selectedCells), [selectedCells]);

  const accountTotal = accounts.reduce((sum, a) => sum + (Number(a.balanceUyu) || 0), 0);

  const monthNetMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of months) {
      const state = ensureMonth(monthData, m.key);
      map[m.key] = state.expenses.reduce((sum, ex) => {
        const val = Number(ex.value) || 0;
        return ex.mode === "+" ? sum + val : sum - val;
      }, 0);
    }
    return map;
  }, [monthData, months]);

  const cumulativeSavings = useMemo(() => {
    const map: Record<string, number> = {};
    let acc = 0;
    for (const m of months) {
      acc += monthNetMap[m.key] || 0;
      map[m.key] = acc;
    }
    return map;
  }, [monthNetMap, months]);

  function updateMonth(key: string, updater: (state: MonthState) => MonthState) {
    setMonthData((prev) => {
      const current = ensureMonth(prev, key);
      return { ...prev, [key]: updater(current) };
    });
  }

  function selectedCellSum(month: string) {
    return selectedCells.reduce((sum, key) => {
      if (!key.startsWith(month)) {
        return sum;
      }
      const value = Number(dayValues[key]);
      return Number.isFinite(value) ? sum + value : sum;
    }, 0);
  }

  function onCellMouseDown(key: string, ctrl: boolean) {
    draggingRef.current = true;
    setSelectedCells((prev) => {
      if (ctrl) {
        return prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key];
      }
      return [key];
    });
  }

  function onCellMouseEnter(key: string) {
    if (!draggingRef.current) {
      return;
    }
    setSelectedCells((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }

  function openCellMenu(ev: React.MouseEvent, month: string) {
    ev.preventDefault();
    setMenu({ visible: true, kind: "cells", monthKey: month, x: ev.clientX + 4, y: ev.clientY + 4 });
  }

  function openExpenseMenu(ev: React.MouseEvent, month: string) {
    ev.preventDefault();
    setMenu({ visible: true, kind: "expenses", monthKey: month, x: ev.clientX + 4, y: ev.clientY + 4 });
  }

  function onExpenseMouseDown(monthKey: string, id: string, ctrl: boolean) {
    expenseDraggingRef.current = { active: true, monthKey };
    setSelectedExpenses((prev) => {
      const current = prev[monthKey] ?? [];
      if (ctrl) {
        return {
          ...prev,
          [monthKey]: current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
        };
      }
      return { ...prev, [monthKey]: [id] };
    });
  }

  function onExpenseMouseEnter(monthKey: string, id: string) {
    if (!expenseDraggingRef.current.active || expenseDraggingRef.current.monthKey !== monthKey) {
      return;
    }
    setSelectedExpenses((prev) => {
      const current = prev[monthKey] ?? [];
      return current.includes(id) ? prev : { ...prev, [monthKey]: [...current, id] };
    });
  }

  function applyBulkValue() {
    const value = String(Number(bulkValue || 0));
    setDayValues((prev) => {
      const next = { ...prev };
      for (const key of selectedCells) {
        next[key] = value;
      }
      return next;
    });
    setMenu((prev) => ({ ...prev, visible: false }));
  }

  function clearSelectedCellsValues() {
    setDayValues((prev) => {
      const next = { ...prev };
      for (const key of selectedCells) {
        delete next[key];
      }
      return next;
    });
    setMenu((prev) => ({ ...prev, visible: false }));
  }

  function createExpenseFromSelectedCells(month: string) {
    const sum = Number(selectedCellSum(month).toFixed(2));
    const name = newExpenseName.trim() || "nuevo gasto";
    updateMonth(month, (current) => ({
      ...current,
      expenses: [...current.expenses, { id: `e-${Math.random().toString(36).slice(2, 10)}`, name, value: sum, mode: "-" }],
    }));
    setNewExpenseName("");
    setMenu((prev) => ({ ...prev, visible: false }));
  }

  function generateResultFromExpenses(month: string) {
    const ids = selectedExpenses[month] ?? [];
    if (ids.length === 0) {
      return;
    }
    const state = ensureMonth(monthData, month);
    const selected = state.expenses.filter((e) => ids.includes(e.id));
    const value = selected.reduce((sum, e) => {
      const val = Number(e.value) || 0;
      return e.mode === "+" ? sum + val : sum - val;
    }, 0);
    const name = newResultName.trim() || `resultado ${state.results.length + 1}`;

    updateMonth(month, (current) => ({
      ...current,
      results: [...current.results, { id: `r-${Math.random().toString(36).slice(2, 10)}`, name, value }],
    }));
    setNewResultName("");
    setMenu((prev) => ({ ...prev, visible: false }));
  }

  return (
    <Page>
      <Shell>
        <Top>
          <Title>/tools/estimativos - calendario + gastos (estilo planilla)</Title>
          <Small>[uso] click y arrastrar en celdas para seleccionar | ctrl+click para multi-select | click derecho para menu</Small>
          <Row>
            <Card>
              <Small>{`Total cuentas: UYU ${accountTotal.toFixed(2)}`}</Small>
              <Small>{uyuPerUsd ? `USD ${(accountTotal / uyuPerUsd).toFixed(2)}` : "USD -"}</Small>
              <Small>{rateLabel}</Small>
            </Card>
            <Card>
              <Small>Estados de cuenta</Small>
              <Row>
                {accounts.map((account) => (
                  <Card key={account.id}>
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
                  </Card>
                ))}
              </Row>
              <Row>
                <Button
                  onClick={() => {
                    setAccounts((prev) => [
                      ...prev,
                      { id: `a-${Math.random().toString(36).slice(2, 10)}`, name: `Cuenta ${prev.length + 1}`, balanceUyu: 0 },
                    ]);
                  }}
                >
                  + cuenta
                </Button>
              </Row>
            </Card>
          </Row>
        </Top>

        <Months>
          {months.map((month, idx) => {
            const cells = buildMonthCells(month.year, month.monthIndex);
            const state = ensureMonth(monthData, month.key);
            const selectedForMonth = selectedExpenses[month.key] ?? [];
            const resultTotal = state.results.reduce((sum, r) => sum + r.value, 0);
            const prevSaving = idx === 0 ? 0 : cumulativeSavings[months[idx - 1].key] ?? 0;
            const differenceCurrent = accountTotal - resultTotal;
            const remainingSavings = accountTotal + prevSaving - resultTotal;

            return (
              <MonthWrap key={month.key}>
                <MonthMain>
                  <MonthTitle>{month.label}</MonthTitle>
                  <WeekHeader>
                    {WEEK_DAYS.map((day) => (
                      <WeekDay key={`${month.key}-${day}`}>{day}</WeekDay>
                    ))}
                  </WeekHeader>
                  <Grid>
                    {cells.map((cell) => (
                      <Cell
                        key={cell.key}
                        $active={selectedCellSet.has(cell.key)}
                        $faded={!cell.inMonth}
                        onMouseDown={(event) => onCellMouseDown(cell.key, event.ctrlKey)}
                        onMouseEnter={() => onCellMouseEnter(cell.key)}
                        onContextMenu={(event) => openCellMenu(event, month.key)}
                      >
                        <CellDate>{cell.dateNumber}</CellDate>
                        <CellInput
                          value={dayValues[cell.key] ?? ""}
                          onChange={(event) => {
                            const value = event.target.value;
                            if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
                              setDayValues((prev) => ({ ...prev, [cell.key]: value }));
                            }
                          }}
                          onMouseDown={(event) => event.stopPropagation()}
                          placeholder="0"
                        />
                      </Cell>
                    ))}
                  </Grid>
                  <Small>{`seleccion celdas (${month.key}): ${selectedCellSum(month.key).toFixed(2)}`}</Small>
                  {idx < months.length - 1 ? <Small>{`continua con ${months[idx + 1].label}`}</Small> : null}
                </MonthMain>

                <MonthSide>
                  <Small>Gastos del mes (lista tipo hoja)</Small>
                  <ExpenseHead>
                    <Small>Nombre</Small>
                    <Small>Valor</Small>
                    <Small>Modo</Small>
                  </ExpenseHead>
                  {state.expenses.map((expense) => (
                    <ExpenseRow
                      key={expense.id}
                      $selected={selectedForMonth.includes(expense.id)}
                      onMouseDown={(event) => onExpenseMouseDown(month.key, expense.id, event.ctrlKey)}
                      onMouseEnter={() => onExpenseMouseEnter(month.key, expense.id)}
                      onContextMenu={(event) => openExpenseMenu(event, month.key)}
                    >
                      <Input
                        value={expense.name}
                        onChange={(event) => {
                          const name = event.target.value;
                          updateMonth(month.key, (current) => ({
                            ...current,
                            expenses: current.expenses.map((e) => (e.id === expense.id ? { ...e, name } : e)),
                          }));
                        }}
                        onMouseDown={(event) => event.stopPropagation()}
                        placeholder="gasto"
                      />
                      <Input
                        type="number"
                        value={expense.value}
                        onChange={(event) => {
                          const value = Number(event.target.value || 0);
                          updateMonth(month.key, (current) => ({
                            ...current,
                            expenses: current.expenses.map((e) => (e.id === expense.id ? { ...e, value } : e)),
                          }));
                        }}
                        onMouseDown={(event) => event.stopPropagation()}
                      />
                      <Select
                        value={expense.mode}
                        onChange={(event) => {
                          const mode = event.target.value as "+" | "-";
                          updateMonth(month.key, (current) => ({
                            ...current,
                            expenses: current.expenses.map((e) => (e.id === expense.id ? { ...e, mode } : e)),
                          }));
                        }}
                        onMouseDown={(event) => event.stopPropagation()}
                      >
                        <option value="-">gasto (-)</option>
                        <option value="+">ingreso (+)</option>
                      </Select>
                    </ExpenseRow>
                  ))}

                  <Row>
                    <Button
                      onClick={() => {
                        updateMonth(month.key, (current) => ({
                          ...current,
                          expenses: [...current.expenses, makeExpense()],
                        }));
                      }}
                    >
                      + fila gasto
                    </Button>
                    <Button
                      onClick={() => {
                        const ids = new Set(selectedForMonth);
                        updateMonth(month.key, (current) => ({
                          ...current,
                          expenses: current.expenses.filter((e) => !ids.has(e.id)),
                        }));
                        setSelectedExpenses((prev) => ({ ...prev, [month.key]: [] }));
                      }}
                    >
                      borrar seleccion
                    </Button>
                  </Row>

                  <Divider />

                  <Small>Resultados generados</Small>
                  {state.results.map((result) => (
                    <ResultBox key={result.id}>{`${result.name}: ${result.value.toFixed(2)}`}</ResultBox>
                  ))}

                  <ResultBox>{`diferencia con cuenta actual: ${differenceCurrent.toFixed(2)}`}</ResultBox>
                  <ResultBox>{`ahorro mes anterior: ${prevSaving.toFixed(2)}`}</ResultBox>
                  <ResultBox>{`ahorros restantes: ${remainingSavings.toFixed(2)}`}</ResultBox>
                </MonthSide>
              </MonthWrap>
            );
          })}
        </Months>
      </Shell>

      {menu.visible ? (
        <Menu ref={menuRef} style={{ left: menu.x, top: menu.y }}>
          {menu.kind === "cells" ? (
            <>
              <Small>sumar en nuevo gasto</Small>
              <Input
                value={newExpenseName}
                onChange={(event) => setNewExpenseName(event.target.value)}
                placeholder="nombre del gasto"
              />
              <Button onClick={() => createExpenseFromSelectedCells(menu.monthKey)}>
                crear gasto con suma seleccionada ({selectedCellSum(menu.monthKey).toFixed(2)})
              </Button>

              <Divider />

              <Small>escribir valor para setear seleccion</Small>
              <Input
                type="number"
                value={bulkValue}
                onChange={(event) => setBulkValue(Number(event.target.value || 0))}
              />
              <Button onClick={applyBulkValue}>setear valor en seleccion</Button>

              <Divider />

              <Button onClick={clearSelectedCellsValues}>borrar valores seleccionados</Button>
            </>
          ) : (
            <>
              <Small>generar resultado</Small>
              <Input
                value={newResultName}
                onChange={(event) => setNewResultName(event.target.value)}
                placeholder="nombre del resultado"
              />
              <Button onClick={() => generateResultFromExpenses(menu.monthKey)}>
                crear resultado desde gastos seleccionados
              </Button>
              <Small>{`seleccionados: ${(selectedExpenses[menu.monthKey] ?? []).length}`}</Small>
            </>
          )}
        </Menu>
      ) : null}
    </Page>
  );
}
