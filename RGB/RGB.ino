const int rot= 9; // vorwärts R
const int gruen= 11; // rückwärts R
const int blau = 10; // vorwärts L
 
void setup() {
  Serial.begin(9600);
  pinMode(rot, OUTPUT);
  pinMode(gruen, OUTPUT);
  pinMode(blau, OUTPUT);
}

String serialInput = "";

void loop() {
  while (Serial.available() > 0) {
    char serialChar = Serial.read();
    
  if (isDigit(serialChar) || serialChar == 'r' || 'g' || 'b' || 'a') {
      serialInput += serialChar;
    }
    
    if (serialChar == '\n') {
      if (serialInput.charAt(0) == 'r') {
        serialInput.remove(0, 1);
          digitalWrite(rot,HIGH);
          digitalWrite(gruen,LOW);
          digitalWrite(blau,LOW); 
          Serial.println("rot");
          
      }
      
       if (serialInput.charAt(0) == 'g') {
        serialInput.remove(0, 1);      
        digitalWrite(rot,LOW);
        digitalWrite(gruen,HIGH);
        digitalWrite(blau,LOW); 
        Serial.println("gruen");
        
      }
      
       if (serialInput.charAt(0) == 'b') {
        serialInput.remove(0, 1);      
        digitalWrite(rot,LOW);
        digitalWrite(gruen,LOW);
        digitalWrite(blau,HIGH); 
        Serial.println("blau");
      }

         if (serialInput.charAt(0) == 'a') {
        serialInput.remove(0, 1);      
        digitalWrite(rot,LOW);
        digitalWrite(gruen,LOW);
        digitalWrite(blau,LOW); 
        Serial.println("aus");
      }
      
      serialInput = "";
    }
  }
  
}
