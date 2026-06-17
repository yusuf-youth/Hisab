import React, { useState, useEffect } from "react";

// 1. КОМПОНЕНТ СТРОКИ ТОВАРА (ТЕПЕРЬ С ОТОБРАЖЕНИЕМ ОСТАТКА)
function ProductRow({
  product,
  sellerId,
  onWeightChange,
  onProductUpdate,
  onDeleteProduct,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDiscount, setShowDiscount] = useState(
    !!product.discountWeight || !!product.discountSalePrice,
  );
  const [showWaste, setShowWaste] = useState(!!product.wasteWeight);

  const [tempName, setTempName] = useState(product.name);
  const [tempCost, setTempCost] = useState(product.costPrice);
  const [tempSale, setTempSale] = useState(product.salePrice);

  // Получаем числовые значения из полей
  const morning = parseFloat(product.morningWeight) || 0;
  const evening = parseFloat(product.eveningWeight) || 0;
  const discountWeight = parseFloat(product.discountWeight) || 0;
  const wasteWeight = parseFloat(product.wasteWeight) || 0;

  // Разница веса за день (сколько всего ушло со склада/точки)
  const totalWeightGone = Math.max(0, morning - evening);

  // Фактически ПРОДАННЫЙ вес (минус то, что выкинули в брак)
  const totalSold = Math.max(0, totalWeightGone - wasteWeight);

  // Вес, проданный по стандартной цене
  const regularSold = Math.max(0, totalSold - discountWeight);

  // Цены
  const salePrice = product.salePrice;
  const discountSalePrice = parseFloat(product.discountSalePrice) || 0;
  const costPrice = product.costPrice;

  // ФИНАНСЫ:
  const revenue = regularSold * salePrice + discountWeight * discountSalePrice;
  const totalCost = totalWeightGone * costPrice;
  const profit = revenue - totalCost;

  // Маржа
  const avgSalePrice = totalSold > 0 ? revenue / totalSold : salePrice;
  const marginPercentage =
    avgSalePrice > 0 ? ((avgSalePrice - costPrice) / avgSalePrice) * 100 : 0;

  const handleSave = () => {
    onProductUpdate(sellerId, product.id, {
      name: tempName,
      costPrice: parseFloat(tempCost) || 0,
      salePrice: parseFloat(tempSale) || 0,
    });
    setIsEditing(false);
  };

  const toggleDiscountSection = () => {
    if (showDiscount) {
      onWeightChange(sellerId, product.id, "discountWeight", "");
      onWeightChange(sellerId, product.id, "discountSalePrice", "");
    }
    setShowDiscount(!showDiscount);
  };

  const toggleWasteSection = () => {
    if (showWaste) {
      onWeightChange(sellerId, product.id, "wasteWeight", "");
    }
    setShowWaste(!showWaste);
  };

  return (
    <div className="product-row">
      <div className="product-row__header">
        {!isEditing ? (
          <>
            <h3 className="product-row__name">{product.name}</h3>
            <div className="product-row__actions-zone">
              <div className="product-row__prices-display">
                <span>
                  Закуп: <strong>{costPrice}₴</strong>
                </span>{" "}
                |{" "}
                <span>
                  {" "}
                  Стандарт: <strong>{salePrice}₴</strong>
                </span>
                <span className="product-row__margin-badge">
                  Маржа: {marginPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="product-row__toggles">
                <button
                  className={`product-row__btn-toggle product-row__btn-toggle--discount ${showDiscount ? "active" : ""}`}
                  onClick={toggleDiscountSection}
                >
                  🏷️ {showDiscount ? "- Уценка" : "+ Уценка"}
                </button>
                <button
                  className={`product-row__btn-toggle product-row__btn-toggle--waste ${showWaste ? "active" : ""}`}
                  onClick={toggleWasteSection}
                >
                  🗑️ {showWaste ? "- Брак" : "+ Брак"}
                </button>
              </div>
              <button
                className="product-row__btn-action"
                onClick={() => setIsEditing(true)}
                title="Редактировать"
              >
                ✏️
              </button>
              <button
                className="product-row__btn-action product-row__btn-action--delete"
                onClick={() =>
                  window.confirm(`Удалить товар "${product.name}"?`) &&
                  onDeleteProduct(sellerId, product.id)
                }
              >
                🗑️
              </button>
            </div>
          </>
        ) : (
          <div className="product-row__edit-form">
            <input
              type="text"
              className="product-row__edit-input product-row__edit-input--name"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
            />
            <input
              type="number"
              className="product-row__edit-input"
              value={tempCost}
              onChange={(e) => setTempCost(e.target.value)}
            />
            <input
              type="number"
              className="product-row__edit-input"
              value={tempSale}
              onChange={(e) => setTempSale(e.target.value)}
            />
            <button className="product-row__btn-confirm" onClick={handleSave}>
              ✅
            </button>
            <button
              className="product-row__btn-confirm"
              onClick={() => setIsEditing(false)}
            >
              ❌
            </button>
          </div>
        )}
      </div>

      {/* СЕТКА ПОЛЕЙ ВВОДА */}
      <div className="product-row__inputs">
        <div className="form-field">
          <label className="form-field__label">Утро (кг)</label>
          <input
            type="number"
            className="form-field__input"
            value={product.morningWeight}
            onChange={(e) =>
              onWeightChange(
                sellerId,
                product.id,
                "morningWeight",
                e.target.value,
              )
            }
            placeholder="0.00"
          />
        </div>
        <div className="form-field">
          <label className="form-field__label">Вечер (кг)</label>
          <input
            type="number"
            className="form-field__input"
            value={product.eveningWeight}
            onChange={(e) =>
              onWeightChange(
                sellerId,
                product.id,
                "eveningWeight",
                e.target.value,
              )
            }
            placeholder="0.00"
          />
        </div>

        {/* ПОЛЯ УЦЕНКИ */}
        {showDiscount && (
          <>
            <div className="form-field form-field--discount">
              <label className="form-field__label text-red">Уценка (кг)</label>
              <input
                type="number"
                className="form-field__input border-red"
                value={product.discountWeight || ""}
                onChange={(e) =>
                  onWeightChange(
                    sellerId,
                    product.id,
                    "discountWeight",
                    e.target.value,
                  )
                }
                placeholder="0.00"
              />
            </div>
            <div className="form-field form-field--discount">
              <label className="form-field__label text-red">
                Цена уценки (₴)
              </label>
              <input
                type="number"
                className="form-field__input border-red"
                value={product.discountSalePrice || ""}
                onChange={(e) =>
                  onWeightChange(
                    sellerId,
                    product.id,
                    "discountSalePrice",
                    e.target.value,
                  )
                }
                placeholder="0"
              />
            </div>
          </>
        )}

        {/* ПОЛЕ БРАКА */}
        {showWaste && (
          <div className="form-field form-field--waste">
            <label className="form-field__label text-orange">
              В Мусор (кг)
            </label>
            <input
              type="number"
              className="form-field__input border-orange"
              value={product.wasteWeight || ""}
              onChange={(e) =>
                onWeightChange(
                  sellerId,
                  product.id,
                  "wasteWeight",
                  e.target.value,
                )
              }
              placeholder="0.00"
            />
          </div>
        )}
      </div>

      {/* НОВЫЙ ДЕТАЛИЗИРОВАННЫЙ БЛОК СТАТИСТИКИ */}
      <div className="product-row__stats-detailed">
        <div className="stats-detailed__info-flow">
          <span className="stats-detailed__item text-green-dark">
            Продано стандарт: <strong>{regularSold.toFixed(1)} кг</strong> по{" "}
            <strong>₴{salePrice}</strong>
          </span>

          {discountWeight > 0 && (
            <span className="stats-detailed__item text-orange-dark">
              Продано уценка: <strong>{discountWeight.toFixed(1)} кг</strong> по{" "}
              <strong>₴{discountSalePrice}</strong>
            </span>
          )}

          {wasteWeight > 0 && (
            <span className="stats-detailed__item text-red-dark">
              В мусор: <strong>{wasteWeight.toFixed(1)} кг</strong>
            </span>
          )}

          <span className="stats-detailed__item text-blue-dark">
            Остаток товара: <strong>{evening.toFixed(1)} кг</strong>
          </span>
        </div>

        <div className="stats-detailed__profit-zone">
          Прибыль:{" "}
          <strong className="text-success-bold">₴{profit.toFixed(0)}</strong>
        </div>
      </div>
    </div>
  );
}

// 2. ФУНКЦИЯ РАСЧЕТА СТАТИСТИКИ ОДНОЙ ТОЧКИ
function calculateSellerStats(seller) {
  let totalGrossRevenue = 0;
  let totalProductsProfit = 0;

  seller.products.forEach((product) => {
    const morning = parseFloat(product.morningWeight) || 0;
    const evening = parseFloat(product.eveningWeight) || 0;
    const discountWeight = parseFloat(product.discountWeight) || 0;
    const discountSalePrice = parseFloat(product.discountSalePrice) || 0;
    const wasteWeight = parseFloat(product.wasteWeight) || 0;

    const totalWeightGone = Math.max(0, morning - evening);
    const totalSold = Math.max(0, totalWeightGone - wasteWeight);
    const regularSold = Math.max(0, totalSold - discountWeight);

    const revenue =
      regularSold * product.salePrice + discountWeight * discountSalePrice;
    const cost = totalWeightGone * product.costPrice;

    totalGrossRevenue += revenue;
    totalProductsProfit += revenue - cost;
  });

  const totalExpenses = (seller.expenses || []).reduce(
    (sum, exp) => sum + exp.amount,
    0,
  );

  return {
    grossRevenue: totalGrossRevenue,
    cashInHand: Math.max(0, totalGrossRevenue - totalExpenses),
    expenses: totalExpenses,
    netProfit: totalProductsProfit - totalExpenses,
  };
}

// 3. КОМПОНЕНТ КАРТОЧКИ ПРОДАВЦА (ТЕПЕРЬ С ВНУТРЕННИМИ ТАБАМИ)
function SellerCard({
  seller,
  onWeightChange,
  onAddProduct,
  onProductUpdate,
  onDeleteProduct,
  onDeleteSeller,
  onAddExpense,
  onDeleteExpense,
}) {
  const [newProdName, setNewProdName] = useState("");
  const [newCostPrice, setNewCostPrice] = useState("");
  const [newSalePrice, setNewSalePrice] = useState("");

  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  const [innerTab, setInnerTab] = useState("products");
  
  // Управляет выбором товара. Если значение "add_new", значит открыта форма создания.
  const [activeProductId, setActiveProductId] = useState(
    seller.products.length > 0 ? seller.products[0].id : "add_new"
  );

  // Следим за списком товаров, чтобы не потерять фокус при удалении
  useEffect(() => {
    if (seller.products.length > 0) {
      if (activeProductId !== "add_new") {
        const exists = seller.products.some((p) => p.id === activeProductId);
        if (!exists) {
          setActiveProductId(seller.products[0].id);
        }
      }
    } else {
      setActiveProductId("add_new");
    }
  }, [seller.products, activeProductId]);

  const stats = calculateSellerStats(seller);

  const handleSubmitProduct = (e) => {
    e.preventDefault();
    if (!newProdName || !newCostPrice || !newSalePrice) return;
    
    const generatedId = Date.now();
    onAddProduct(seller.id, {
      id: generatedId,
      name: newProdName,
      costPrice: parseFloat(newCostPrice),
      salePrice: parseFloat(newSalePrice),
    });
    
    // После создания сразу открываем этот новый товар
    setActiveProductId(generatedId);
    setNewProdName("");
    setNewCostPrice("");
    setNewSalePrice("");
  };

  const handleSubmitExpense = (e) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !expenseAmount) return;
    onAddExpense(seller.id, expenseTitle, parseFloat(expenseAmount));
    setExpenseTitle("");
    setExpenseAmount("");
  };

  const currentActiveProduct = seller.products.find((p) => p.id === activeProductId);

  return (
    <div className="seller-report">
      {/* Шапка точки */}
      <div className="seller-report__header">
        <div className="seller-report__title-zone">
          <h2 className="seller-report__title">{seller.name}</h2>
        </div>
        <button
          className="seller-report__btn-delete-seller"
          onClick={() =>
            window.confirm(`Удалить точку "${seller.name}" со всеми данными?`) && 
            onDeleteSeller(seller.id)
          }
        >
          ❌ Удалить точку
        </button>
      </div>

      {/* ВНУТРЕННЯЯ НАВИГАЦИЯ ТОЧКИ */}
      <div className="inner-tabs">
        <button
          className={`inner-tab-btn ${innerTab === "products" ? "inner-tab-btn--active" : ""}`}
          onClick={() => setInnerTab("products")}
        >
          📦 Товары ({seller.products.length})
        </button>
        <button
          className={`inner-tab-btn ${innerTab === "expenses" ? "inner-tab-btn--active" : ""}`}
          onClick={() => setInnerTab("expenses")}
        >
          📉 Расходы ({(seller.expenses || []).length})
        </button>
        <button
          className={`inner-tab-btn ${innerTab === "totals" ? "inner-tab-btn--active" : ""}`}
          onClick={() => setInnerTab("totals")}
        >
          💰 Итоги
        </button>
      </div>

      {/* СОДЕРЖИМОЕ АКТИВНОГО ТАБА */}
      <div className="inner-tab-content">
        
        {/* Вкладка 1: ТОВАРЫ */}
        {innerTab === "products" && (
          <>
            {/* Горизонтальная лента табов товаров + кнопка добавления */}
            <div className="product-tabs" style={{ display: "flex", gap: "8px", marginBottom: "15px", overflowX: "auto", paddingBottom: "5px" }}>
              {seller.products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className={`inner-tab-btn ${activeProductId === product.id ? "inner-tab-btn--active" : ""}`}
                  onClick={() => setActiveProductId(product.id)}
                >
                  {product.name}
                </button>
              ))}
              
              {/* НОВОЕ: Таб-кнопка добавления нового товара */}
              <button
                type="button"
                className={`inner-tab-btn ${activeProductId === "add_new" ? "inner-tab-btn--active" : ""}`}
                style={{ borderStyle: "dashed", fontWeight: "bold" }}
                onClick={() => setActiveProductId("add_new")}
              >
                ➕ Новый товар
              </button>
            </div>

            <div className="seller-report__products">
              {activeProductId === "add_new" ? (
                /* Форма создания нового товара открывается как отдельный таб */
                <div className="add-product-section" style={{ background: "white", padding: "15px", borderRadius: "12px", border: "1px solid var(--border)" }}>
                  <h3 style={{ marginTop: 0, marginBottom: "15px", fontSize: "16px" }}>Добавить новый товар на точку</h3>
                  <form onSubmit={handleSubmitProduct} className="add-product-form">
                    <input
                      type="text"
                      placeholder="Название (например: 🍊 Мандарины)"
                      className="form-field__input"
                      style={{ marginBottom: "10px" }}
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      required
                    />
                    <div className="add-product-form__row" style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                      <input
                        type="number"
                        placeholder="Закуп (₴)"
                        className="form-field__input"
                        value={newCostPrice}
                        onChange={(e) => setNewCostPrice(e.target.value)}
                        required
                      />
                      <input
                        type="number"
                        placeholder="Продажа (₴)"
                        className="form-field__input"
                        value={newSalePrice}
                        onChange={(e) => setNewSalePrice(e.target.value)}
                        required
                      />
                    </div>
                    <div className="add-product-form__actions">
                      <button type="submit" className="btn btn--save">
                        Создать товар
                      </button>
                      {seller.products.length > 0 && (
                        <button
                          type="button"
                          className="btn btn--cancel"
                          style={{ marginLeft: "10px" }}
                          onClick={() => setActiveProductId(seller.products[0].id)}
                        >
                          Отмена
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              ) : (
                /* Отображение выбранного рабочего товара */
                currentActiveProduct && (
                  <ProductRow
                    key={currentActiveProduct.id}
                    product={currentActiveProduct}
                    sellerId={seller.id}
                    onWeightChange={onWeightChange}
                    onProductUpdate={onProductUpdate}
                    onDeleteProduct={onDeleteProduct}
                  />
                )
              )}
            </div>
          </>
        )}

        {/* Вкладка 2: РАСХОДЫ */}
        {innerTab === "expenses" && (
          <div className="seller-report__expenses-section">
            <h4 className="seller-report__expenses-title">📉 Расходы из кассы</h4>
            <div className="seller-report__expenses-list">
              {!seller.expenses || seller.expenses.length === 0 ? (
                <p className="seller-report__expenses-empty">
                  Расходов за сегодня нет.
                </p>
              ) : (
                seller.expenses.map((exp) => (
                  <div key={exp.id} className="expense-item">
                    <span className="expense-item__title">📌 {exp.title}</span>
                    <div className="expense-item__right">
                      <span className="expense-item__amount">₴-{exp.amount}</span>
                      <button
                        className="expense-item__btn-delete"
                        onClick={() => onDeleteExpense(seller.id, exp.id)}
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSubmitExpense} className="add-expense-form">
              <input
                type="text"
                placeholder="На что"
                className="form-field__input form-field__input--sm"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Сумма"
                className="form-field__input form-field__input--sm"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                required
              />
              <button type="submit" className="btn btn--save btn--sm">
                Внести
              </button>
            </form>
          </div>
        )}

        {/* Вкладка 3: ИТОГИ ПО ВЫРУЧКЕ И ПРИБЫЛИ */}
        {innerTab === "totals" && (
          <div className="seller-report__total">
            <div className="seller-report__total-breakdown">
              <div className="total-breakdown__row">
                <span>Продано товаров на сумму:</span>
                <strong>₴{stats.grossRevenue.toFixed(0)}</strong>
              </div>
              {stats.expenses > 0 && (
                <div className="total-breakdown__row total-breakdown__row--expense">
                  <span>Расходы из кассы:</span>
                  <strong>₴-{stats.expenses}</strong>
                </div>
              )}
            </div>

            <div className="seller-report__total-results">
              <div className="total-result-block total-result-block--revenue">
                <span className="total-result-block__label">Выручка в кассе:</span>
                <span className="total-result-block__value">
                  ₴{stats.cashInHand.toFixed(0)}
                </span>
              </div>
              <div className="total-result-block total-result-block--profit">
                <span className="total-result-block__label">
                  Чистая прибыль точки:
                </span>
                <span className="total-result-block__value">
                  ₴{stats.netProfit.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// 4. КОМПОНЕНТ СТРАНИЦЫ ОБЩЕЙ СВОДКИ
function SummaryPage({ sellersData, onSelectSeller }) {
  let globalGross = 0;
  let globalCash = 0;
  let globalExpenses = 0;
  let globalNetProfit = 0;

  const rows = sellersData.map((seller) => {
    const s = calculateSellerStats(seller);
    globalGross += s.grossRevenue;
    globalCash += s.cashInHand;
    globalExpenses += s.expenses;
    globalNetProfit += s.netProfit;

    return { id: seller.id, name: seller.name, ...s };
  });

  return (
    <div className="summary-page">
      <h2 className="summary-page__title">📊 Финансовая сводка по рынку</h2>

      <div className="summary-page__cards">
        <div className="summary-card summary-card--revenue">
          <span className="summary-card__label">Вся выручка в кассах</span>
          <span className="summary-card__value">₴{globalCash.toFixed(0)}</span>
          <span className="summary-card__sub">
            Грязными: ₴{globalGross.toFixed(0)}
          </span>
        </div>
        <div className="summary-card summary-card--expenses">
          <span className="summary-card__label">Общие расходы</span>
          <span className="summary-card__value">
            ₴-{globalExpenses.toFixed(0)}
          </span>
          <span className="summary-card__sub">Забрали на нужды</span>
        </div>
        <div className="summary-card summary-card--profit">
          <span className="summary-card__label">Общая чистая прибыль</span>
          <span className="summary-card__value">
            ₴{globalNetProfit.toFixed(0)}
          </span>
          <span className="summary-card__sub">Ваш чистый заработок</span>
        </div>
      </div>

      <div className="summary-page__table-wrapper">
        <h3 className="summary-page__sub-title">Сравнение торговых точек</h3>
        {rows.length === 0 ? (
          <p className="seller-report__empty">Нет данных для анализа.</p>
        ) : (
          <table className="summary-table">
            <thead>
              <tr>
                <th>Продавец / Точка</th>
                <th className="text-right">Продажи (грязными)</th>
                <th className="text-right">Расходы</th>
                <th className="text-right">В кассе (к сдаче)</th>
                <th className="text-right">Чистая прибыль</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="summary-table__row"
                  onClick={() => onSelectSeller(row.id)}
                >
                  <td className="summary-table__cell-name">👤 {row.name}</td>
                  <td className="text-right">₴{row.grossRevenue.toFixed(0)}</td>
                  <td className="text-right text-red">
                    ₴{row.expenses > 0 ? `-${row.expenses}` : 0}
                  </td>
                  <td className="text-right text-blue font-bold">
                    ₴{row.cashInHand.toFixed(0)}
                  </td>
                  <td className="text-right text-green font-bold">
                    ₴{row.netProfit.toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// 5. ГЛАВНЫЙ ЭКРАН И НАВИГАЦИЯ
export default function MarketReport() {
  const [sellersData, setSellersData] = useState(() => {
    const savedData = localStorage.getItem("market_report_data");
    return savedData
      ? JSON.parse(savedData)
      : [
          {
            id: 1,
            name: "Маша (Центр)",
            products: [
              {
                id: 101,
                name: "🥬 Редиска",
                costPrice: 50,
                salePrice: 75,
                morningWeight: "",
                eveningWeight: "",
                discountWeight: "",
                discountSalePrice: "",
                wasteWeight: "",
              },
            ],
            expenses: [],
          },
        ];
  });

  const [activeSellerId, setActiveSellerId] = useState("summary");
  const [showAddSellerForm, setShowAddSellerForm] = useState(false);
  const [newSellerName, setNewSellerName] = useState("");

  useEffect(() => {
    localStorage.setItem("market_report_data", JSON.stringify(sellersData));
    if (
      activeSellerId !== "summary" &&
      !sellersData.some((s) => s.id === activeSellerId)
    ) {
      setActiveSellerId("summary");
    }
  }, [sellersData, activeSellerId]);

  const handleDeleteSeller = (sellerId) => {
    setSellersData((prevData) =>
      prevData.filter((seller) => seller.id !== sellerId),
    );
  };

  const handleAddSeller = (e) => {
    e.preventDefault();
    if (!newSellerName.trim()) return;
    const newId =
      sellersData.length > 0
        ? Math.max(...sellersData.map((s) => s.id)) + 1
        : 1;
    setSellersData([
      ...sellersData,
      { id: newId, name: newSellerName, products: [], expenses: [] },
    ]);
    setActiveSellerId(newId);
    setNewSellerName("");
    setShowAddSellerForm(false);
  };

  const handleWeightChange = (sellerId, productId, field, value) => {
    setSellersData((prevData) =>
      prevData.map((seller) =>
        seller.id !== sellerId
          ? seller
          : {
              ...seller,
              products: seller.products.map((prod) =>
                prod.id === productId ? { ...prod, [field]: value } : prod,
              ),
            },
      ),
    );
  };

  const handleProductUpdate = (sellerId, productId, updatedFields) => {
    setSellersData((prevData) =>
      prevData.map((seller) =>
        seller.id !== sellerId
          ? seller
          : {
              ...seller,
              products: seller.products.map((prod) =>
                prod.id === productId ? { ...prod, ...updatedFields } : prod,
              ),
            },
      ),
    );
  };

  const handleDeleteProduct = (sellerId, productId) => {
    setSellersData((prevData) =>
      prevData.map((seller) =>
        seller.id !== sellerId
          ? seller
          : {
              ...seller,
              products: seller.products.filter((prod) => prod.id !== productId),
            },
      ),
    );
  };

  const handleAddProduct = (sellerId, newProduct) => {
    setSellersData((prevData) =>
      prevData.map((seller) =>
        seller.id !== sellerId
          ? seller
          : {
              ...seller,
              products: [
                ...seller.products,
                {
                  id: Date.now(),
                  ...newProduct,
                  morningWeight: "",
                  eveningWeight: "",
                  discountWeight: "",
                  discountSalePrice: "",
                  wasteWeight: "",
                },
              ],
            },
      ),
    );
  };

  const handleAddExpense = (sellerId, title, amount) => {
    setSellersData((prevData) =>
      prevData.map((seller) => {
        if (seller.id !== sellerId) return seller;
        return {
          ...seller,
          expenses: [
            ...(seller.expenses || []),
            { id: Date.now(), title, amount },
          ],
        };
      }),
    );
  };

  const handleDeleteExpense = (sellerId, expenseId) => {
    setSellersData((prevData) =>
      prevData.map((seller) => {
        if (seller.id !== sellerId) return seller;
        return {
          ...seller,
          expenses: seller.expenses.filter((exp) => exp.id !== expenseId),
        };
      }),
    );
  };

  const handleResetDailyWeights = () => {
    if (
      window.confirm("Очистить все веса, уценку, брак и расходы на новый день?")
    ) {
      setSellersData((prevData) =>
        prevData.map((seller) => ({
          ...seller,
          products: seller.products.map((prod) => ({
            ...prod,
            morningWeight: "",
            eveningWeight: "",
            discountWeight: "",
            discountSalePrice: "",
            wasteWeight: "",
          })),
          expenses: [],
        })),
      );
    }
  };

  const activeSeller = sellersData.find((s) => s.id === activeSellerId);

  return (
    <div className="market-report">
      <header className="market-report__header">
        <div className="market-report__header-top">
          <h1 className="market-report__main-title">Касса базара</h1>
          <button
            className="market-report__btn-reset"
            onClick={handleResetDailyWeights}
          >
            🔄 Сбросить день
          </button>
        </div>
        <p className="market-report__date">
          Дата: {new Date().toLocaleDateString()}
        </p>
      </header>

      <div className="market-report__tabs-container">
        <div className="market-report__tabs shadow-scroll">
          <button
            className={`market-report__tab-btn ${activeSellerId === "summary" ? "market-report__tab-btn--active market-report__tab-btn--summary" : ""}`}
            onClick={() => setActiveSellerId("summary")}
          >
            📊 Общая сводка
          </button>
          {sellersData.map((seller) => (
            <button
              key={seller.id}
              className={`market-report__tab-btn ${seller.id === activeSellerId ? "market-report__tab-btn--active" : ""}`}
              onClick={() => setActiveSellerId(seller.id)}
            >
              👤 {seller.name}
            </button>
          ))}
          <button
            className="market-report__btn-tab-add"
            onClick={() => setShowAddSellerForm(true)}
          >
            ➕ Новая точка
          </button>
        </div>
      </div>

      {showAddSellerForm && (
        <div className="market-report__overlay">
          <form onSubmit={handleAddSeller} className="add-seller-form">
            <h3 className="add-seller-form__title">
              Добавить новую точку продаж
            </h3>
            <input
              type="text"
              placeholder="Имя продавца"
              className="form-field__input"
              value={newSellerName}
              onChange={(e) => setNewSellerName(e.target.value)}
              required
            />
            <div className="add-seller-form__actions">
              <button type="submit" className="btn btn--save">
                Создать
              </button>
              <button
                type="button"
                className="btn btn--cancel"
                onClick={() => setShowAddSellerForm(false)}
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <main className="market-report__content">
        {activeSellerId === "summary" ? (
          <SummaryPage
            sellersData={sellersData}
            onSelectSeller={(id) => setActiveSellerId(id)}
          />
        ) : activeSeller ? (
          <SellerCard
            seller={activeSeller}
            onWeightChange={handleWeightChange}
            onAddProduct={handleAddProduct}
            onProductUpdate={handleProductUpdate}
            onDeleteProduct={handleDeleteProduct}
            onDeleteSeller={handleDeleteSeller}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        ) : null}
      </main>
    </div>
  );
}
