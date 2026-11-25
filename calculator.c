// Simple Calculator in C
// Compile: gcc calculator.c -o calculator.exe
// Run:     calculator.exe

#include <stdio.h>
#include <math.h>

int main() {
    int choice;
    double a, b, result;

    while (1) {
        printf("\n====== CALCULATOR ======\n");
        printf("1. Add (+)\n");
        printf("2. Subtract (-)\n");
        printf("3. Multiply (*)\n");
        printf("4. Divide (/)\n");
        printf("5. Modulus (%%)\n");
        printf("6. Power (a^b)\n");
        printf("7. Square Root\n");
        printf("8. Exit\n");
        printf("Apna choice likho (1-8): ");
        scanf("%d", &choice);

        if (choice == 8) {
            printf("Bye bye!\n");
            break;
        }

        if (choice < 1 || choice > 8) {
            printf("Galat choice! 1 se 8 tak likho.\n");
            continue;
        }

        if (choice == 7) {
            printf("Number likho: ");
            scanf("%lf", &a);
            if (a < 0) {
                printf("Negative number ka square root nahi hota!\n");
            } else {
                printf("Answer: %.2f\n", sqrt(a));
            }
            continue;
        }

        printf("Pehla number: ");
        scanf("%lf", &a);
        printf("Dusra number: ");
        scanf("%lf", &b);

        switch (choice) {
            case 1:
                result = a + b;
                printf("Answer: %.2f\n", result);
                break;
            case 2:
                result = a - b;
                printf("Answer: %.2f\n", result);
                break;
            case 3:
                result = a * b;
                printf("Answer: %.2f\n", result);
                break;
            case 4:
                if (b == 0) {
                    printf("0 se divide nahi kar sakte!\n");
                } else {
                    printf("Answer: %.2f\n", a / b);
                }
                break;
            case 5:
                if (b == 0) {
                    printf("0 se modulus nahi kar sakte!\n");
                } else {
                    printf("Answer: %.2f\n", fmod(a, b));
                }
                break;
            case 6:
                printf("Answer: %.2f\n", pow(a, b));
                break;
        }
    }

    return 0;
}
