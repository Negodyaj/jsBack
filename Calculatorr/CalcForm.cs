using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Calculatorr
{
    public partial class CalcForm : Form
    {
        private const string _readyToStartMessage = "Готов к вычислениям!";
        private bool waitingForOperation = false;

        public CalcForm()
        {
            InitializeComponent();

            resultBox.Text = "0";
            currentOperationBox.Text = _readyToStartMessage;
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            
        }

        private void perdelka1_Click(object sender, EventArgs e)
        {
            DoNumberedButtonClick("1");
        }

        private void button2_Click(object sender, EventArgs e)
        {
            DoNumberedButtonClick("2");
        }

        private void button3_Click(object sender, EventArgs e)
        {
            DoNumberedButtonClick("3");
        }

        private void button4_Click(object sender, EventArgs e)
        {
            DoNumberedButtonClick("4");
        }

        private void button5_Click(object sender, EventArgs e)
        {
            DoNumberedButtonClick("5");
        }

        private void button6_Click(object sender, EventArgs e)
        {
            DoNumberedButtonClick("6");
        }

        private void button7_Click(object sender, EventArgs e)
        {
            DoNumberedButtonClick("7");
        }

        private void button8_Click(object sender, EventArgs e)
        {
            DoNumberedButtonClick("8");
        }

        private void button9_Click(object sender, EventArgs e) 
        {
            DoNumberedButtonClick("9");
        }

        private void button0_Click(object sender, EventArgs e)
        {
            DoNumberedButtonClick("0");
        }

        private void DoNumberedButtonClick(string digit)
        {
            if (waitingForOperation)
                return;

            if (currentOperationBox.Text == _readyToStartMessage)
                currentOperationBox.Text = "";

            currentOperationBox.Text += digit;
        }

        private void buttonPlus_Click(object sender, EventArgs e)
        {
            DoOperationButtonClick("+");
        }

        private void buttonMinus_Click(object sender, EventArgs e)
        {
            DoOperationButtonClick("-");
        }

        private void buttonMultiply_Click(object sender, EventArgs e)
        {
            DoOperationButtonClick("*");
        }

        private void buttonDiv_Click(object sender, EventArgs e)
        {
            DoOperationButtonClick("/");
        }

        private void DoOperationButtonClick(string action)
        {
            if (currentOperationBox.Text == _readyToStartMessage ||
                currentOperationBox.Text.Contains(" "))
                return;

            currentOperationBox.Text += $" {action} ";
            waitingForOperation = false;
        }

        private void buttonResult_Click(object sender, EventArgs e)
        {
            if (currentOperationBox.Text == _readyToStartMessage)
                return;

            string[] parts = currentOperationBox.Text.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries); // 123456 + 65463
            if (parts.Length < 3)
                return;

            int number1 = Convert.ToInt32(parts[0]);
            int number2 = Convert.ToInt32(parts[2]);
            string operation = parts[1];

            if (operation == "/" && number2 == 0)
                return;

            int result = GetResult(number1, number2, operation);

            resultBox.Text = result.ToString();
            currentOperationBox.Text = result.ToString();
            waitingForOperation = true;
        }

        private int GetResult(int number1, int number2, string operation)
        {
            return 42;

            /*
             * 
             switch (operation)
            {
                default:
                    result += 42;
                    break;
            } 
             * 
             */
        }
    }
}
