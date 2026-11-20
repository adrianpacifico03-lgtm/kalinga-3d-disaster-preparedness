package ph.kalinga.app

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    primary = Color(0xFF2DD4BF),
                    background = Color(0xFF0B1120),
                    surface = Color(0xFF111827),
                    onBackground = Color(0xFFF8FAFC),
                    onSurface = Color(0xFFF8FAFC)
                )
            ) {
                val context = LocalContext.current
                val checklistItems = remember {
                    mutableStateListOf(
                        "Drinking Water (4L/person/day for 72h)" to false,
                        "Non-perishable Food & Canned Goods" to false,
                        "LED Flashlight & Extra Batteries" to false,
                        "First-Aid Kit & Prescription Meds" to false,
                        "Power Bank & Charging Cables" to false,
                        "Important IDs & Waterproof Documents" to false,
                        "Emergency Cash in Small Bills" to false,
                        "Whistle & Multi-tool" to false,
                        "Hygiene Supplies & Face Masks" to false,
                        "Rain Gear / Blanket / Extra Clothes" to false
                    )
                }
                var activeTab by remember { mutableIntStateOf(0) }
                val checkedCount = checklistItems.count { it.second }
                val readinessScore = ((checkedCount.toFloat() / checklistItems.size) * 100).toInt()

                fun dialNumber(number: String) {
                    context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:$number")))
                }

                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color(0xFF0B1120))
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Text("KALINGA", color = Color(0xFF2DD4BF), fontSize = 20.sp, fontWeight = FontWeight.Bold)
                    Text("Magandang gabi", color = Color(0xFFF8FAFC), fontSize = 26.sp, fontWeight = FontWeight.Bold)
                    Text("Prepared Together. Safer Together.", color = Color(0xFF94A3B8), fontSize = 13.sp)

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("Dashboard", "Ready Check", "Hotlines").forEachIndexed { index, title ->
                            if (activeTab == index) {
                                Button(onClick = { activeTab = index }) { Text(title) }
                            } else {
                                OutlinedButton(onClick = { activeTab = index }) { Text(title) }
                            }
                        }
                    }

                    if (activeTab == 0) {
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text("YOUR PREPAREDNESS", color = Color(0xFF94A3B8), fontSize = 12.sp)
                                Text("$readinessScore% READY", color = Color(0xFF38BDF8), fontSize = 28.sp, fontWeight = FontWeight.ExtraBold)
                                Text("$checkedCount of ${checklistItems.size} checklist items packed", color = Color(0xFFCBD5E1), fontSize = 13.sp)
                                Button(onClick = { activeTab = 1 }) { Text("Continue Preparing") }
                            }
                        }

                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text("Weather & Daily Preparedness Tip", color = Color(0xFFF8FAFC), fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
                                Text("27°C • Partly Cloudy • Wind 3 km/h • Humidity 90%", color = Color(0xFF38BDF8), fontSize = 13.sp)
                                Text(
                                    "Store at least 4 liters of drinking water per family member per day for 72 hours, plus extra for pets.",
                                    color = Color(0xFFCBD5E1),
                                    fontSize = 13.sp
                                )
                            }
                        }
                    }

                    if (activeTab == 1) {
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text("Ready Check ($checkedCount/${checklistItems.size})", color = Color(0xFFF8FAFC), fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
                                checklistItems.forEachIndexed { idx, item ->
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .background(Color(0xFF1E293B), RoundedCornerShape(10.dp))
                                            .padding(horizontal = 10.dp, vertical = 6.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(
                                            text = item.first,
                                            color = Color(0xFFF8FAFC),
                                            fontSize = 13.sp,
                                            modifier = Modifier.weight(1f)
                                        )
                                        Checkbox(
                                            checked = item.second,
                                            onCheckedChange = { checked ->
                                                checklistItems[idx] = item.first to checked
                                            }
                                        )
                                    }
                                }
                            }
                        }
                    }

                    if (activeTab == 2) {
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                Text("Circle of Safety — Emergency Hotlines", color = Color(0xFFF8FAFC), fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
                                listOf(
                                    "Philippine Emergency Hotline" to "911",
                                    "Philippine Red Cross" to "143",
                                    "NDRRMC Trunkline" to "89115061"
                                ).forEach { (label, number) ->
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .background(Color(0xFF1E293B), RoundedCornerShape(10.dp))
                                            .padding(12.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column {
                                            Text(label, color = Color(0xFFF8FAFC), fontSize = 14.sp, fontWeight = FontWeight.Medium)
                                            Text(number, color = Color(0xFF94A3B8), fontSize = 12.sp)
                                        }
                                        Button(onClick = { dialNumber(number) }) { Text("Call") }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
