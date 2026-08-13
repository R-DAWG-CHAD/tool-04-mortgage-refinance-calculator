document.addEventListener('DOMContentLoaded', () => {
  const currentBalanceInput = document.getElementById('currentBalance');
  const currentRateInput = document.getElementById('currentRate');
  const currentYearsLeftInput = document.getElementById('currentYearsLeft');
  const newRateInput = document.getElementById('newRate');
  const newTermYearsInput = document.getElementById('newTermYears');
  const closingCostsInput = document.getElementById('closingCosts');
  const rollClosingCostsInput = document.getElementById('rollClosingCosts');

  const breakEvenMonthsDisplay = document.getElementById('breakEvenMonthsDisplay');
  const breakEvenYearsDisplay = document.getElementById('breakEvenYearsDisplay');
  const monthlySavingsDisplay = document.getElementById('monthlySavingsDisplay');
  const lifetimeSavingsDisplay = document.getElementById('lifetimeSavingsDisplay');
  const currentPaymentDisplay = document.getElementById('currentPaymentDisplay');
  const newPaymentDisplay = document.getElementById('newPaymentDisplay');
  const timelineProgress = document.getElementById('timelineProgress');
  const timelineNote = document.getElementById('timelineNote');

  function calculateRefinance() {
    const balance = parseFloat(currentBalanceInput.value) || 0;
    const currentRate = (parseFloat(currentRateInput.value) || 0) / 100 / 12;
    const currentMonthsLeft = (parseFloat(currentYearsLeftInput.value) || 0) * 12;

    const newRate = (parseFloat(newRateInput.value) || 0) / 100 / 12;
    const newTermMonths = (parseFloat(newTermYearsInput.value) || 0) * 12;
    let closingCosts = parseFloat(closingCostsInput.value) || 0;
    const rollCosts = rollClosingCostsInput.checked;

    if (balance <= 0 || currentMonthsLeft <= 0 || newTermMonths <= 0) return;

    // Current Monthly Payment (Principal & Interest)
    const currentPayment = currentRate > 0 
      ? balance * (currentRate * Math.pow(1 + currentRate, currentMonthsLeft)) / (Math.pow(1 + currentRate, currentMonthsLeft) - 1)
      : balance / currentMonthsLeft;

    // New Principal Balance
    const newPrincipal = rollCosts ? balance + closingCosts : balance;

    // New Monthly Payment
    const newPayment = newRate > 0
      ? newPrincipal * (newRate * Math.pow(1 + newRate, newTermMonths)) / (Math.pow(1 + newRate, newTermMonths) - 1)
      : newPrincipal / newTermMonths;

    // Monthly Savings
    const monthlySavings = currentPayment - newPayment;

    // Effective upfront cost for break-even calculation
    const upfrontCost = closingCosts;

    let breakEvenMonths = 0;
    if (monthlySavings > 0 && upfrontCost > 0) {
      breakEvenMonths = Math.ceil(upfrontCost / monthlySavings);
    } else if (upfrontCost === 0 && monthlySavings > 0) {
      breakEvenMonths = 0;
    } else {
      breakEvenMonths = Infinity;
    }

    // Total Remaining Interest Payments comparison
    const currentTotalPaid = currentPayment * currentMonthsLeft;
    const currentInterestPaid = currentTotalPaid - balance;

    const newTotalPaid = newPayment * newTermMonths;
    const newInterestPaid = newTotalPaid - newPrincipal;

    const totalLifetimeSavings = (currentTotalPaid - newTotalPaid) - (rollCosts ? 0 : closingCosts);

    // Update UI
    currentPaymentDisplay.textContent = formatCurrency(currentPayment);
    newPaymentDisplay.textContent = formatCurrency(newPayment);
    monthlySavingsDisplay.textContent = monthlySavings >= 0 ? formatCurrency(monthlySavings) : `-${formatCurrency(Math.abs(monthlySavings))}`;
    lifetimeSavingsDisplay.textContent = totalLifetimeSavings >= 0 ? formatCurrency(totalLifetimeSavings) : `-${formatCurrency(Math.abs(totalLifetimeSavings))}`;

    if (isFinite(breakEvenMonths)) {
      breakEvenMonthsDisplay.textContent = `${breakEvenMonths} Months`;
      const breakEvenYears = (breakEvenMonths / 12).toFixed(1);
      breakEvenYearsDisplay.textContent = `${breakEvenYears} Years to Recover Closing Costs`;

      // Timeline Progress (cap at 120 months max for bar display)
      const pct = Math.min(100, Math.max(5, (breakEvenMonths / 120) * 100));
      timelineProgress.style.width = `${pct}%`;

      if (breakEvenMonths <= 36) {
        timelineNote.textContent = `✅ Excellent candidate! Break-even in ${breakEvenYears} years is well within average homeowner tenure (5-7 years).`;
        timelineNote.style.color = '#34d399';
      } else if (breakEvenMonths <= 60) {
        timelineNote.textContent = `⚠️ Moderate break-even horizon (${breakEvenYears} years). Only refinance if planning to stay long term.`;
        timelineNote.style.color = '#fbbf24';
      } else {
        timelineNote.textContent = `❌ High risk: Takes ${breakEvenYears} years to break even. Refinancing may not be financially optimal.`;
        timelineNote.style.color = '#f87171';
      }
    } else {
      breakEvenMonthsDisplay.textContent = 'N/A';
      breakEvenYearsDisplay.textContent = 'New payment is higher than current payment.';
      timelineProgress.style.width = '0%';
      timelineNote.textContent = 'Refinancing will increase your monthly payment.';
      timelineNote.style.color = '#f87171';
    }
  }

  function formatCurrency(val) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(val);
  }

  const allInputs = [
    currentBalanceInput, currentRateInput, currentYearsLeftInput,
    newRateInput, newTermYearsInput, closingCostsInput, rollClosingCostsInput
  ];

  allInputs.forEach(input => {
    input.addEventListener('input', calculateRefinance);
    input.addEventListener('change', calculateRefinance);
  });

  calculateRefinance();
});
