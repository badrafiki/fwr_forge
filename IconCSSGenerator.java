// This program will generate the css file for the game icons from the icon sheets
public class IconCSSGenerator
{ 
   public static final int MAX_LAYERS = 10;
   public static final int TOTAL_ICONS = 675;
   public static final String ICONSHEET_PREFIX = "../img/iconsheet";
   public static final String ICONSHEET_SUFFIX = ".png";
   public static final int TOTAL_SHEETS = 3;
   
   public static final int ROWS = 15;
   public static final int COLUMNS = 15;
   public static final int ICON_WIDTH = 32;
   public static final int ICON_HEIGHT = 32;
   
	public static void main(String [] args)
	{
      //generateHTML();
		generateCSS();
	}
   
   private static void generateCSS()
   {
      System.out.println("div.game-icon-container { display: inline-block; width: 32px; height: 32px; }");      
      System.out.println("span.game-icon-layered { position: absolute; display: block; }");
      System.out.println("span.game-icon { display: inline-block;}");
      
      // Layers  
      for (int i = 1; i <= MAX_LAYERS; i++)
         System.out.println(".layer-" + i + " { z-index: " + i + "; }");
      
      // Icons CSS
      int currentIcon = 0;      
      for (int currentSheet = 1; currentSheet <= TOTAL_SHEETS; currentSheet++)
      {
         int currentLeft = 1;
         int currentTop = -1;
      
         for (int i = 1; i <= ROWS; i++)
         {
            for (int j = 1; j <= COLUMNS; j++)
            {
               System.out.println(".game-icon-" + currentIcon + " { width: " + ICON_WIDTH + "px; height: " + ICON_HEIGHT 
               + "px; background: url('" + ICONSHEET_PREFIX + currentSheet + ICONSHEET_SUFFIX + "') " + (-1*currentLeft) + "px " + currentTop + "px; }");
               
               currentLeft += ICON_WIDTH + 1;
               
               if (++currentIcon >= TOTAL_ICONS) return;
            }
            
            currentLeft = 1;         
            currentTop -= ICON_HEIGHT + 1;
         }
      }    
   }
   
   private static void generateHTML()
   {
      System.out.println("<HTML><HEAD><link rel=\"stylesheet\" href=\"game-icons.css\"></HEAD><BODY>");
      for (int i = 0; i < TOTAL_ICONS; i++)
      {
         System.out.println("<span class=\"game-icon game-icon-" + i + "\"></span>");
      }
      System.out.println("</BODY></HTML>");
   }

}